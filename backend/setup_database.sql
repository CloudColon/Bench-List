-- PostgreSQL Database Setup Script for Bench List Application
-- Run this script as a PostgreSQL superuser (e.g., postgres)

-- Create the database
CREATE DATABASE bench_list_db;

-- Create the user
CREATE USER bench_admin WITH PASSWORD 'admin';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE bench_list_db TO bench_admin;

-- Connect to the database
\c bench_list_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO bench_admin;

-- Grant future table privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bench_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bench_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO bench_admin;

-- Display success message
\echo 'Database setup completed successfully!'
\echo 'Database: bench_list_db'
\echo 'User: bench_admin'
\echo 'Remember to update the password in your .env file'
