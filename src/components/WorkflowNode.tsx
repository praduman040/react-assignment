import { useState, useRef, useEffect } from "react";
import { WorkflowNode as WorkflowNodeType } from "../types/workflow";
import { Plus, X } from "lucide-react";

interface WorkflowNodeProps {
  node: WorkflowNodeType;
  onDelete: (nodeId: string) => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onAddNode: (nodeId: string, branchType?: "true" | "false") => void;
}

export function WorkflowNode({ node, onDelete, onUpdateLabel, onAddNode }: WorkflowNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [labelValue, setLabelValue] = useState(node.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleLabelClick = () => {
    if (node.type !== "start") {
      setIsEditing(true);
    }
  };

  const handleSaveLabel = () => {
    setIsEditing(false);
    if (labelValue.trim() && labelValue !== node.label) {
      onUpdateLabel(node.id, labelValue.trim());
    } else {
      setLabelValue(node.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveLabel();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setLabelValue(node.label);
    }
  };

  const getNodeClassName = () => {
    const baseClass = "workflow-node";
    return `${baseClass} ${baseClass}--${node.type}`;
  };

  const canDelete = node.type !== "start";
  const showAddButton = node.type !== "end";
  const isBranchNode = node.type === "branch";

  return (
    <div className={getNodeClassName()}>
      <div className="workflow-node__content">
        {canDelete && (
          <button
            className="workflow-node__delete"
            onClick={() => onDelete(node.id)}
            aria-label="Delete node"
          >
            <X size={16} />
          </button>
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="workflow-node__input"
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleSaveLabel}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="workflow-node__label" onClick={handleLabelClick}>
            {node.label}
          </div>
        )}

        <div className="workflow-node__type-badge">{node.type}</div>
      </div>

      {showAddButton && !isBranchNode && (
        <div className="workflow-node__handle workflow-node__handle--bottom">
          <button
            className="workflow-node__add-btn"
            onClick={() => onAddNode(node.id)}
            aria-label="Add node"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {isBranchNode && (
        <>
          <div className="workflow-node__handle workflow-node__handle--left">
            <button
              className="workflow-node__add-btn workflow-node__add-btn--true"
              onClick={() => onAddNode(node.id, "true")}
              aria-label="Add true branch"
            >
              <Plus size={16} />
            </button>
            <span className="workflow-node__branch-label">True</span>
          </div>
          <div className="workflow-node__handle workflow-node__handle--right">
            <button
              className="workflow-node__add-btn workflow-node__add-btn--false"
              onClick={() => onAddNode(node.id, "false")}
              aria-label="Add false branch"
            >
              <Plus size={16} />
            </button>
            <span className="workflow-node__branch-label">False</span>
          </div>
        </>
      )}
    </div>
  );
}
