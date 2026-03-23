-- PostgreSQL schema for GHL Fertility Marketplace App

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  clinic_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vapi_assistants (
  id TEXT PRIMARY KEY,
  location_id TEXT REFERENCES locations(id),
  vapi_assistant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_logs (
  id TEXT PRIMARY KEY,
  location_id TEXT REFERENCES locations(id),
  vapi_call_id TEXT,
  contact_id TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  status TEXT,
  duration_seconds INTEGER,
  transcript TEXT,
  summary TEXT,
  actions_taken JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id SERIAL PRIMARY KEY,
  location_id TEXT REFERENCES locations(id),
  workflow_type TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  contact_id TEXT,
  status TEXT DEFAULT 'pending',
  payload JSONB DEFAULT '{}',
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_call_logs_location ON call_logs(location_id);
CREATE INDEX idx_call_logs_contact ON call_logs(contact_id);
CREATE INDEX idx_workflow_runs_location ON workflow_runs(location_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
