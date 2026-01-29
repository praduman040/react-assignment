export type NodeType = "start" | "action" | "branch" | "end";

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  children: string[];
  branchChildren?: {
    true: string | null;
    false: string | null;
  };
}

export interface WorkflowState {
  nodes: Record<string, WorkflowNode>;
  rootId: string;
}

export interface NodePosition {
  x: number;
  y: number;
}

export type WorkflowAction =
  | { type: "ADD_NODE"; payload: { parentId: string; nodeType: NodeType; branchType?: "true" | "false" } }
  | { type: "DELETE_NODE"; payload: { nodeId: string } }
  | { type: "UPDATE_NODE_LABEL"; payload: { nodeId: string; label: string } }
  | { type: "LOAD_WORKFLOW"; payload: WorkflowState };
