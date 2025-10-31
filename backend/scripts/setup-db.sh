#!/bin/bash

# Database setup script for JobJäger
# This script helps set up PostgreSQL database and user

echo "🔍 Checking PostgreSQL status..."
pg_isready

echo ""
echo "📋 Attempting to create database and user..."
echo "This requires PostgreSQL sudo access. You may be prompted for your system password."
echo ""

# Create PostgreSQL user and database
sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'jobjager_user') THEN
    CREATE USER jobjager_user WITH PASSWORD 'jobjager_dev_password';
  END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE jobjager OWNER jobjager_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'jobjager')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE jobjager TO jobjager_user;

-- List databases
\l jobjager

-- Show user
\du jobjager_user
EOF

echo ""
echo "✅ Database setup complete!"
echo "Update your .env file with:"
echo 'DATABASE_URL="postgresql://jobjager_user:jobjager_dev_password@localhost:5432/jobjager"'
