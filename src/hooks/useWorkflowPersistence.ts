import { useState } from "react";
import { WorkflowState } from "../types/workflow";

export interface SavedWorkflow {
  id: string;
  name: string;
  state: WorkflowState;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "workflow_builder_data";

function getStoredWorkflows(): SavedWorkflow[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setStoredWorkflows(data: SavedWorkflow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useWorkflowPersistence() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveWorkflow = async (
    name: string,
    state: WorkflowState
  ): Promise<string | null> => {
    setSaving(true);
    setError(null);

    try {
      const workflows = getStoredWorkflows();
      const now = new Date().toISOString();

      const existing = workflows.find((w) => w.name === name);

      if (existing) {
        existing.state = state;
        existing.updated_at = now;
        setStoredWorkflows(workflows);
        return existing.id;
      }

      const newWorkflow: SavedWorkflow = {
        id: crypto.randomUUID(),
        name,
        state,
        created_at: now,
        updated_at: now,
      };

      setStoredWorkflows([newWorkflow, ...workflows]);
      return newWorkflow.id;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save workflow";
      setError(message);
      console.error(err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const loadWorkflow = async (id: string): Promise<WorkflowState | null> => {
    setLoading(true);
    setError(null);

    try {
      const workflows = getStoredWorkflows();
      const workflow = workflows.find((w) => w.id === id);
      return workflow ? workflow.state : null;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load workflow";
      setError(message);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listWorkflows = async (): Promise<SavedWorkflow[]> => {
    setLoading(true);
    setError(null);

    try {
      const workflows = getStoredWorkflows();
      return workflows.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime()
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load workflows";
      setError(message);
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (id: string): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      const workflows = getStoredWorkflows().filter((w) => w.id !== id);
      setStoredWorkflows(workflows);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete workflow";
      setError(message);
      console.error(err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveWorkflow,
    loadWorkflow,
    listWorkflows,
    deleteWorkflow,
    saving,
    loading,
    error,
  };
}

