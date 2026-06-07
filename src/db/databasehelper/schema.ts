export const DATABASE_NAME = 'safedrive.db';

export const CREATE_TABLES_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS drive_session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_time TEXT NOT NULL,
  end_time TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  distance_km REAL NOT NULL DEFAULT 0,
  average_speed REAL NOT NULL DEFAULT 0,
  max_speed REAL NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 100,
  safety_rating TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS drive_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  penalty INTEGER NOT NULL DEFAULT 1,
  severity REAL NOT NULL DEFAULT 0,
  value REAL,
  unit TEXT,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES drive_session(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sensor_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL UNIQUE,
  avg_acceleration REAL NOT NULL DEFAULT 0,
  max_acceleration REAL NOT NULL DEFAULT 0,
  avg_rotation REAL NOT NULL DEFAULT 0,
  max_rotation REAL NOT NULL DEFAULT 0,
  phone_movements INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES drive_session(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL UNIQUE,
  feedback TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES drive_session(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_drive_event_session_id ON drive_event(session_id);
CREATE INDEX IF NOT EXISTS idx_sensor_summary_session_id ON sensor_summary(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_session_id ON ai_feedback(session_id);
`;
