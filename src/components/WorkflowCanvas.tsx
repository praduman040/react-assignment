import { useState, useMemo } from "react";
import { WorkflowState, NodeType } from "../types/workflow";
import { WorkflowNode } from "./WorkflowNode";
import { ConnectionLine } from "./ConnectionLine";
import { NodeControls } from "./NodeControls";
import { calculateLayout } from "../utils/layoutCalculator";

interface WorkflowCanvasProps {
  state: WorkflowState;
  onAddNode: (parentId: string, nodeType: NodeType, branchType?: "true" | "false") => void;
  onDeleteNode: (nodeId: string) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
}

interface ControlsState {
  parentId: string;
  branchType?: "true" | "false";
  position: { x: number; y: number };
}

export function WorkflowCanvas({ state, onAddNode, onDeleteNode, onUpdateLabel }: WorkflowCanvasProps) {
  const [controlsState, setControlsState] = useState<ControlsState | null>(null);

  const positions = useMemo(() => calculateLayout(state), [state]);

  const handleAddNodeClick = (nodeId: string, branchType?: "true" | "false") => {
    const nodePosition = positions.get(nodeId);
    if (!nodePosition) return;

    setControlsState({
      parentId: nodeId,
      branchType,
      position: {
        x: nodePosition.x + 100,
        y: nodePosition.y + 100,
      },
    });
  };

  const handleAddNodeFromControls = (nodeType: NodeType) => {
    if (controlsState) {
      onAddNode(controlsState.parentId, nodeType, controlsState.branchType);
    }
  };

  const renderConnections = () => {
    const lines: JSX.Element[] = [];

    Object.values(state.nodes).forEach((node) => {
      const fromPos = positions.get(node.id);
      if (!fromPos) return;

      if (node.type === "branch" && node.branchChildren) {
        if (node.branchChildren.true) {
          const toPos = positions.get(node.branchChildren.true);
          if (toPos) {
            lines.push(
              <ConnectionLine
                key={`${node.id}-true-${node.branchChildren.true}`}
                from={fromPos}
                to={toPos}
                isBranch={true}
                branchType="true"
              />
            );
          }
        }
        if (node.branchChildren.false) {
          const toPos = positions.get(node.branchChildren.false);
          if (toPos) {
            lines.push(
              <ConnectionLine
                key={`${node.id}-false-${node.branchChildren.false}`}
                from={fromPos}
                to={toPos}
                isBranch={true}
                branchType="false"
              />
            );
          }
        }
      } else {
        node.children.forEach((childId) => {
          const toPos = positions.get(childId);
          if (toPos) {
            lines.push(
              <ConnectionLine
                key={`${node.id}-${childId}`}
                from={fromPos}
                to={toPos}
              />
            );
          }
        });
      }
    });

    return lines;
  };

  const canvasBounds = useMemo(() => {
    let minX = 0;
    let minY = 0;
    let maxX = 800;
    let maxY = 600;

    positions.forEach((pos) => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + 200);
      maxY = Math.max(maxY, pos.y + 80);
    });

    return {
      width: maxX - minX + 200,
      height: maxY - minY + 200,
    };
  }, [positions]);

  return (
    <div className="workflow-canvas">
      <svg
        className="workflow-canvas__svg"
        width={canvasBounds.width}
        height={canvasBounds.height}
      >
        {renderConnections()}
      </svg>

      {Object.values(state.nodes).map((node) => {
        const position = positions.get(node.id);
        if (!position) return null;

        return (
          <div
            key={node.id}
            className="workflow-canvas__node"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
          >
            <WorkflowNode
              node={node}
              onDelete={onDeleteNode}
              onUpdateLabel={onUpdateLabel}
              onAddNode={handleAddNodeClick}
            />
          </div>
        );
      })}

      {controlsState && (
        <NodeControls
          position={controlsState.position}
          onAddNode={handleAddNodeFromControls}
          onClose={() => setControlsState(null)}
        />
      )}
    </div>
  );
}
