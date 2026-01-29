import { WorkflowState, NodePosition } from "../types/workflow";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 100;
const VERTICAL_SPACING = 120;

interface NodeLayout {
  id: string;
  position: NodePosition;
  width: number;
  subtreeWidth: number;
}

function calculateSubtreeWidth(
  nodeId: string,
  nodes: WorkflowState["nodes"],
  memo: Map<string, number>
): number {
  if (memo.has(nodeId)) {
    return memo.get(nodeId)!;
  }

  const node = nodes[nodeId];
  if (!node) return NODE_WIDTH;

  let childrenIds: string[] = [];

  if (node.type === "branch" && node.branchChildren) {
    const trueChild = node.branchChildren.true;
    const falseChild = node.branchChildren.false;
    if (trueChild) childrenIds.push(trueChild);
    if (falseChild) childrenIds.push(falseChild);
  } else {
    childrenIds = node.children;
  }

  if (childrenIds.length === 0) {
    memo.set(nodeId, NODE_WIDTH);
    return NODE_WIDTH;
  }

  const childWidths = childrenIds.map((childId) =>
    calculateSubtreeWidth(childId, nodes, memo)
  );
  const totalWidth = childWidths.reduce((sum, width) => sum + width, 0) +
    (childWidths.length - 1) * HORIZONTAL_SPACING;

  const width = Math.max(NODE_WIDTH, totalWidth);
  memo.set(nodeId, width);
  return width;
}

function layoutNode(
  nodeId: string,
  nodes: WorkflowState["nodes"],
  x: number,
  y: number,
  memo: Map<string, number>,
  positions: Map<string, NodePosition>
): void {
  const node = nodes[nodeId];
  if (!node || positions.has(nodeId)) return;

  const subtreeWidth = calculateSubtreeWidth(nodeId, nodes, memo);
  const nodeX = x + subtreeWidth / 2 - NODE_WIDTH / 2;

  positions.set(nodeId, { x: nodeX, y });

  let childrenIds: string[] = [];

  if (node.type === "branch" && node.branchChildren) {
    const trueChild = node.branchChildren.true;
    const falseChild = node.branchChildren.false;
    if (trueChild) childrenIds.push(trueChild);
    if (falseChild) childrenIds.push(falseChild);
  } else {
    childrenIds = node.children;
  }

  if (childrenIds.length === 0) return;

  const childWidths = childrenIds.map((childId) =>
    calculateSubtreeWidth(childId, nodes, memo)
  );

  let currentX = x;
  const nextY = y + NODE_HEIGHT + VERTICAL_SPACING;

  childrenIds.forEach((childId, index) => {
    layoutNode(childId, nodes, currentX, nextY, memo, positions);
    currentX += childWidths[index] + HORIZONTAL_SPACING;
  });
}

export function calculateLayout(state: WorkflowState): Map<string, NodePosition> {
  const memo = new Map<string, number>();
  const positions = new Map<string, NodePosition>();

  calculateSubtreeWidth(state.rootId, state.nodes, memo);
  layoutNode(state.rootId, state.nodes, 0, 50, memo, positions);

  return positions;
}

export { NODE_WIDTH, NODE_HEIGHT };
