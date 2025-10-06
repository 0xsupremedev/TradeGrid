CREATE TABLE IF NOT EXISTS processed_trades (
  trade_id TEXT PRIMARY KEY,
  tx_hash TEXT,
  submitted_at INTEGER
);

CREATE TABLE IF NOT EXISTS batches (
  batch_id TEXT PRIMARY KEY,
  size INTEGER,
  submitted_at INTEGER,
  tx_hash TEXT
);

CREATE TABLE IF NOT EXISTS failed_trades (
  trade_id TEXT PRIMARY KEY,
  reason TEXT,
  last_attempt_at INTEGER,
  attempts INTEGER DEFAULT 0
);


