import { useReducer } from "react";
import { WorkflowState, WorkflowAction, NodeType, WorkflowNode } from "../types/workflow";

const initialState: WorkflowState = {
  rootId: "root",
  nodes: {
    root: {
      id: "root",
      type: "start",
      label: "Start",
      children: [],
    },
  },
};

function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createNode(type: NodeType, label: string): WorkflowNode {
  const id = generateId();
  const node: WorkflowNode = {
    id,
    type,
    label,
    children: [],
  };

  if (type === "branch") {
    node.branchChildren = {
      true: null,
      false: null,
    };
  }

  return node;
}

function addNode(
  state: WorkflowState,
  parentId: string,
  nodeType: NodeType,
  branchType?: "true" | "false"
): WorkflowState {
  const newNode = createNode(nodeType, nodeType.charAt(0).toUpperCase() + nodeType.slice(1));
  const parent = state.nodes[parentId];

  if (!parent) return state;

  const newNodes = { ...state.nodes, [newNode.id]: newNode };

  if (parent.type === "branch" && branchType && parent.branchChildren) {
    newNodes[parentId] = {
      ...parent,
      branchChildren: {
        ...parent.branchChildren,
        [branchType]: newNode.id,
      },
    };
  } else {
    newNodes[parentId] = {
      ...parent,
      children: [...parent.children, newNode.id],
    };
  }

  return {
    ...state,
    nodes: newNodes,
  };
}

function deleteNode(state: WorkflowState, nodeId: string): WorkflowState {
  if (nodeId === state.rootId) return state;

  const nodeToDelete = state.nodes[nodeId];
  if (!nodeToDelete) return state;

  const newNodes = { ...state.nodes };
  delete newNodes[nodeId];

  const childrenToReconnect = nodeToDelete.type === "branch" && nodeToDelete.branchChildren
    ? Object.values(nodeToDelete.branchChildren).filter((id): id is string => id !== null)
    : nodeToDelete.children;

  Object.keys(newNodes).forEach((id) => {
    const node = newNodes[id];

    if (node.children.includes(nodeId)) {
      newNodes[id] = {
        ...node,
        children: node.children.filter((childId) => childId !== nodeId).concat(childrenToReconnect),
      };
    }

    if (node.branchChildren) {
      const updatedBranchChildren = { ...node.branchChildren };
      let changed = false;

      if (updatedBranchChildren.true === nodeId) {
        updatedBranchChildren.true = childrenToReconnect[0] || null;
        changed = true;
      }
      if (updatedBranchChildren.false === nodeId) {
        updatedBranchChildren.false = childrenToReconnect[1] || childrenToReconnect[0] || null;
        changed = true;
      }

      if (changed) {
        newNodes[id] = {
          ...node,
          branchChildren: updatedBranchChildren,
        };
      }
    }
  });

  return {
    ...state,
    nodes: newNodes,
  };
}

function updateNodeLabel(state: WorkflowState, nodeId: string, label: string): WorkflowState {
  const node = state.nodes[nodeId];
  if (!node) return state;

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [nodeId]: {
        ...node,
        label,
      },
    },
  };
}

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case "ADD_NODE":
      return addNode(
        state,
        action.payload.parentId,
        action.payload.nodeType,
        action.payload.branchType
      );
    case "DELETE_NODE":
      return deleteNode(state, action.payload.nodeId);
    case "UPDATE_NODE_LABEL":
      return updateNodeLabel(state, action.payload.nodeId, action.payload.label);
    case "LOAD_WORKFLOW":
      return action.payload;
    default:
      return state;
  }
}

export function useWorkflowReducer() {
  return useReducer(workflowReducer, initialState);
}
