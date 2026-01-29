/*
  # Create workflows table for persistent storage

  1. New Tables
    - `workflows`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - workflow name
      - `state` (jsonb) - complete workflow state
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `workflows` table
    - Users can only read/write/delete their own workflows
    - Anonymous users cannot access workflows
*/

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  state jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflows_user_id_idx ON workflows(user_id);

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workflows"
  ON workflows
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create workflows"
  ON workflows
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON workflows
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON workflows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
