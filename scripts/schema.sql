-- SS Traders Document Management System
-- Run this in your Neon SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(20) DEFAULT '#d97706',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO work_categories (name, color) VALUES
  ('Proprietor', '#d97706'),
  ('Partnership', '#2563eb')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS works (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  type VARCHAR(100) NOT NULL,
  loa VARCHAR(255),
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_works (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, work_id)
);

CREATE TABLE IF NOT EXISTS folder_types (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) DEFAULT '📁',
  color VARCHAR(20) DEFAULT '#2563eb',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO folder_types (key, name, icon, color, is_system) VALUES
  ('quo',  'Quotation',      '📋', '#d97706', true),
  ('ten',  'Tender',         '📁', '#2563eb', true),
  ('inv',  'Invoice',        '🧾', '#059669', true),
  ('bill', 'Bills',          '💳', '#dc2626', true),
  ('draw', 'Drawings',       '📐', '#7c3aed', true),
  ('cert', 'Certificates',   '🏅', '#f59e0b', true),
  ('cor',  'Correspondence', '✉️', '#0ea5e9', true),
  ('misc', 'Miscellaneous',  '📎', '#ec4899', true)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  folder_key VARCHAR(50) NOT NULL,
  name VARCHAR(500) NOT NULL,
  r2_key VARCHAR(1000) NOT NULL,
  size BIGINT,
  ext VARCHAR(20),
  description TEXT,
  file_date DATE,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
