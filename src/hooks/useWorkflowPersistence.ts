import { useState } from "react";
import { WorkflowState } from "../types/workflow";
import { supabase } from "../lib/supabase";

export interface SavedWorkflow {
  id: string;
  name: string;
  state: WorkflowState;
  created_at: string;
  updated_at: string;
}

export function useWorkflowPersistence() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveWorkflow = async (name: string, state: WorkflowState): Promise<string | null> => {
    setSaving(true);
    setError(null);

    try {
      const { data: existingData } = await supabase
        .from("workflows")
        .select("id")
        .eq("name", name)
        .maybeSingle();

      if (existingData) {
        const { error: updateError } = await supabase
          .from("workflows")
          .update({ state, updated_at: new Date().toISOString() })
          .eq("id", existingData.id);

        if (updateError) throw updateError;
        return existingData.id;
      } else {
        const { data, error: insertError } = await supabase
          .from("workflows")
          .insert({ name, state })
          .select("id")
          .maybeSingle();

        if (insertError) throw insertError;
        return data?.id ?? null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save workflow";
      setError(message);
      console.error("Save workflow error:", err);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const loadWorkflow = async (id: string): Promise<WorkflowState | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("workflows")
        .select("state")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      return data?.state ?? null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load workflow";
      setError(message);
      console.error("Load workflow error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const listWorkflows = async (): Promise<SavedWorkflow[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("workflows")
        .select("id, name, state, created_at, updated_at")
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;
      return (data ?? []) as SavedWorkflow[];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load workflows";
      setError(message);
      console.error("List workflows error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (id: string): Promise<boolean> => {
    setSaving(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("workflows")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete workflow";
      setError(message);
      console.error("Delete workflow error:", err);
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
