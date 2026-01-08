-- Create users table (required for Replit Auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  profile_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- Create index on date for faster filtering
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Create sessions table for express-session (required for Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSONB NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions ("expire");

