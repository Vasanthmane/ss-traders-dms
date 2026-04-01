-- SS Traders Document Management System
-- Run this in your Neon SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  role      VARCHAR(20)  NOT NULL DEFAULT 'user',  -- 'admin' | 'user'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS works (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(500) NOT NULL,
  type       VARCHAR(20)  NOT NULL,   -- 'proprietor' | 'partnership'
  loa        VARCHAR(255),
  location   VARCHAR(255),
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Which users can see which works (admin sees all — enforced in API)
CREATE TABLE IF NOT EXISTS user_works (
  user_id INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  work_id INTEGER NOT NULL REFERENCES works(id)  ON DELETE CASCADE,
  PRIMARY KEY (user_id, work_id)
);

CREATE TABLE IF NOT EXISTS files (
  id          SERIAL PRIMARY KEY,
  work_id     INTEGER     NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  folder_key  VARCHAR(50) NOT NULL,   -- quo, ten, inv, bill, draw, cert, cor, misc
  name        VARCHAR(500) NOT NULL,
  r2_key      VARCHAR(1000) NOT NULL, -- path in R2 bucket
  size        BIGINT,
  ext         VARCHAR(20),
  description TEXT,
  file_date   DATE,
  uploaded_by INTEGER REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
