import { useState, useEffect } from "react";
import { WorkflowState } from "../types/workflow";
import { useWorkflowPersistence, SavedWorkflow } from "../hooks/useWorkflowPersistence";
import { X, Trash2, Download, Plus } from "lucide-react";

interface WorkflowManagerProps {
  currentState: WorkflowState;
  onLoadWorkflow: (state: WorkflowState) => void;
  onClose: () => void;
}

export function WorkflowManager({
  currentState,
  onLoadWorkflow,
  onClose,
}: WorkflowManagerProps) {
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"save" | "load">("save");

  const { saveWorkflow, listWorkflows, deleteWorkflow, loading, error } =
    useWorkflowPersistence();

  useEffect(() => {
    loadWorkflowsList();
  }, []);

  const loadWorkflowsList = async () => {
    const list = await listWorkflows();
    setWorkflows(list);
  };

  const handleSave = async () => {
    if (!workflowName.trim()) return;

    const success = await saveWorkflow(workflowName, currentState);
    if (success) {
      setShowSaveForm(false);
      setWorkflowName("Untitled Workflow");
      await loadWorkflowsList();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      const success = await deleteWorkflow(id);
      if (success) {
        await loadWorkflowsList();
      }
    }
  };

  const handleLoad = async (workflow: SavedWorkflow) => {
    onLoadWorkflow(workflow.state);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="workflow-manager__overlay" onClick={onClose}>
      <div className="workflow-manager" onClick={(e) => e.stopPropagation()}>
        <div className="workflow-manager__header">
          <h2 className="workflow-manager__title">Workflow Manager</h2>
          <button className="workflow-manager__close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="workflow-manager__tabs">
          <button
            className={`workflow-manager__tab ${activeTab === "save" ? "workflow-manager__tab--active" : ""}`}
            onClick={() => setActiveTab("save")}
          >
            Save
          </button>
          <button
            className={`workflow-manager__tab ${activeTab === "load" ? "workflow-manager__tab--active" : ""}`}
            onClick={() => setActiveTab("load")}
          >
            Load
          </button>
        </div>

        <div className="workflow-manager__content">
          {activeTab === "save" ? (
            <div className="workflow-manager__section">
              {!showSaveForm ? (
                <button
                  className="workflow-manager__new-btn"
                  onClick={() => setShowSaveForm(true)}
                >
                  <Plus size={18} />
                  Save Current Workflow
                </button>
              ) : (
                <div className="workflow-manager__form">
                  <div className="workflow-manager__field">
                    <label className="workflow-manager__label">Workflow Name</label>
                    <input
                      type="text"
                      className="workflow-manager__input"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="Enter workflow name"
                      autoFocus
                    />
                  </div>
                  {error && <div className="workflow-manager__error">{error}</div>}
                  <div className="workflow-manager__form-actions">
                    <button
                      className="workflow-manager__btn workflow-manager__btn--primary"
                      onClick={handleSave}
                      disabled={loading || !workflowName.trim()}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="workflow-manager__btn workflow-manager__btn--secondary"
                      onClick={() => setShowSaveForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="workflow-manager__section">
              {workflows.length === 0 ? (
                <p className="workflow-manager__empty">No saved workflows yet</p>
              ) : (
                <div className="workflow-manager__list">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="workflow-manager__item">
                      <div className="workflow-manager__item-info">
                        <h3 className="workflow-manager__item-name">{workflow.name}</h3>
                        <p className="workflow-manager__item-date">
                          Updated: {formatDate(workflow.updated_at)}
                        </p>
                      </div>
                      <div className="workflow-manager__item-actions">
                        <button
                          className="workflow-manager__item-btn workflow-manager__item-btn--load"
                          onClick={() => handleLoad(workflow)}
                          title="Load workflow"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          className="workflow-manager__item-btn workflow-manager__item-btn--delete"
                          onClick={() => handleDelete(workflow.id)}
                          title="Delete workflow"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {error && <div className="workflow-manager__error">{error}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
