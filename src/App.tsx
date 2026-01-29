import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./pages/AuthPage";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import { WorkflowManager } from "./components/WorkflowManager";
import { useWorkflowReducer } from "./hooks/useWorkflowReducer";
import { Save, LogOut, Loader } from "lucide-react";

function WorkflowApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [state, dispatch] = useWorkflowReducer();
  const [showManager, setShowManager] = useState(false);

  if (authLoading) {
    return (
      <div className="app-loading">
        <Loader className="app-loading__spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleAddNode = (
    parentId: string,
    nodeType: "start" | "action" | "branch" | "end",
    branchType?: "true" | "false"
  ) => {
    dispatch({
      type: "ADD_NODE",
      payload: { parentId, nodeType, branchType },
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    dispatch({
      type: "DELETE_NODE",
      payload: { nodeId },
    });
  };

  const handleUpdateLabel = (nodeId: string, label: string) => {
    dispatch({
      type: "UPDATE_NODE_LABEL",
      payload: { nodeId, label },
    });
  };

  const handleLoadWorkflow = (newState: typeof state) => {
    dispatch({
      type: "LOAD_WORKFLOW",
      payload: newState,
    } as any);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Workflow Builder</h1>
        <div className="app__header-actions">
          <button className="app__save-btn" onClick={() => setShowManager(true)}>
            <Save size={18} />
            <span>Save & Load</span>
          </button>
          <button className="app__signout-btn" onClick={handleSignOut} title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="app__main">
        <WorkflowCanvas
          state={state}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onUpdateLabel={handleUpdateLabel}
        />
      </main>

      {showManager && (
        <WorkflowManager
          currentState={state}
          onLoadWorkflow={handleLoadWorkflow}
          onClose={() => setShowManager(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <WorkflowApp />
    </AuthProvider>
  );
}

export default App;
