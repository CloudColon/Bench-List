# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for the Employee Management System.

## 📋 Prerequisites

- PostgreSQL installed on your system
- Python 3.8+ installed
- Virtual environment activated

---

## 🔧 Step 1: Install PostgreSQL

### Windows

**Option 1: Official Installer**
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Default port: 5432

**Option 2: Using Chocolatey**
```bash
choco install postgresql
```

### macOS

**Using Homebrew:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 🗄️ Step 2: Create Database and User

### Option A: Using psql Command Line

**1. Access PostgreSQL as superuser:**

**Windows:**
```bash
psql -U postgres
```

**Linux/macOS:**
```bash
sudo -u postgres psql
```

**2. Create Database and User:**
```sql
-- Create database
CREATE DATABASE bench_list_db;

-- Create user with password
CREATE USER bench_admin WITH PASSWORD 'your_secure_password';

-- Grant privileges
ALTER ROLE bench_admin SET client_encoding TO 'utf8';
ALTER ROLE bench_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE bench_admin SET timezone TO 'UTC';

-- Grant all privileges on database
GRANT ALL PRIVILEGES ON DATABASE bench_list_db TO bench_admin;

-- Exit psql
\q
```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin 4
2. Right-click on "Databases" → Create → Database
   - Database name: `bench_list_db`
   - Owner: `postgres`
3. Right-click on "Login/Group Roles" → Create → Login/Group Role
   - General tab: Name = `bench_admin`
   - Definition tab: Password = `your_secure_password`
   - Privileges tab: Check "Can login?"
4. Right-click on `bench_list_db` → Properties → Security
   - Add `bench_admin` with all privileges

---

## ⚙️ Step 3: Configure Django Project

### 1. Install Python Packages

Already done! But if needed:
```bash
pip install psycopg2-binary python-decouple python-dotenv
```

### 2. Configure Environment Variables

Edit the `.env` file in the backend directory:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database Configuration
USE_POSTGRES=True

# PostgreSQL Settings
DB_NAME=bench_list_db
DB_USER=bench_admin
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Other settings...
```

**⚠️ IMPORTANT:** 
- Change `your_secure_password` to your actual PostgreSQL password
- Generate a new SECRET_KEY for production
- Never commit `.env` file to version control!

### 3. Generate a New Secret Key (Optional but Recommended)

Run this in Python:
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Copy the output to your `.env` file as `SECRET_KEY`.

---

## 🚀 Step 4: Run Migrations

Navigate to the backend directory and run:

```bash
cd d:\Github\Bench-List\backend

# Make migrations
python manage.py makemigrations

# Apply migrations to PostgreSQL
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

When creating superuser:
- Email: your_email@example.com
- First name: Your Name
- Last name: Last Name
- Password: (enter a secure password)

---

## ✅ Step 5: Verify Database Connection

### Check if connected to PostgreSQL:

```bash
python manage.py dbshell
```

You should see PostgreSQL prompt:
```
bench_list_db=>
```

Type `\dt` to see all tables:
```sql
\dt
```

Type `\q` to exit.

---

## 🔄 Switching Between SQLite and PostgreSQL

The project supports both databases. To switch:

### Use PostgreSQL:
```env
USE_POSTGRES=True
```

### Use SQLite (for testing):
```env
USE_POSTGRES=False
```

---

## 🧪 Step 6: Test the Setup

### 1. Start the server:
```bash
python manage.py runserver
```

### 2. Open Swagger UI:
http://localhost:8000/swagger/

### 3. Test registration:
- Use `POST /api/auth/register/`
- Register a new user
- Login to get JWT token
- Test other endpoints

---

## 📊 PostgreSQL Useful Commands

### Connect to Database:
```bash
psql -U bench_admin -d bench_list_db
```

### Common psql Commands:
```sql
\l              -- List all databases
\c bench_list_db -- Connect to database
\dt             -- List all tables
\d+ tablename   -- Describe table structure
\du             -- List all users
SELECT * FROM accounts_user LIMIT 5;  -- Query users
\q              -- Quit
```

### Check Database Size:
```sql
SELECT pg_size_pretty(pg_database_size('bench_list_db'));
```

### View Active Connections:
```sql
SELECT * FROM pg_stat_activity WHERE datname = 'bench_list_db';
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use `.env.example` for team reference

2. **Use strong passwords**
   - Database password
   - Django SECRET_KEY
   - Admin user password

3. **In production:**
   - Set `DEBUG=False`
   - Use environment-specific `.env` files
   - Enable SSL/TLS for database connections
   - Use managed PostgreSQL services (AWS RDS, Azure Database, etc.)

---

## 🐛 Troubleshooting

### Error: "FATAL: password authentication failed"

**Solution:**
1. Check your password in `.env` file
2. Verify user exists: `psql -U postgres -c "\du"`
3. Reset password:
```sql
ALTER USER bench_admin WITH PASSWORD 'new_password';
```

### Error: "could not connect to server"

**Solution:**
1. Check if PostgreSQL is running:
   - Windows: Services → PostgreSQL
   - Linux: `sudo systemctl status postgresql`
   - macOS: `brew services list`

2. Check port 5432 is not blocked:
```bash
netstat -an | findstr 5432
```

### Error: "database does not exist"

**Solution:**
```sql
CREATE DATABASE bench_list_db;
```

### Error: "FATAL: role does not exist"

**Solution:**
```sql
CREATE USER bench_admin WITH PASSWORD 'your_password';
```

### Django Migration Error

**Solution:**
```bash
# Drop all tables and recreate
python manage.py flush

# Or delete migrations and start fresh
python manage.py migrate --run-syncdb
```

---

## 🎯 PostgreSQL Configuration for Production

Edit `postgresql.conf`:

```conf
# Connection Settings
max_connections = 100
shared_buffers = 256MB

# Performance
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB

# Logging
log_connections = on
log_disconnections = on
log_duration = on
```

Restart PostgreSQL after changes:
```bash
# Windows (as Administrator)
net stop postgresql-x64-15
net start postgresql-x64-15

# Linux
sudo systemctl restart postgresql
```

---

## 📈 Backup and Restore

### Backup Database:
```bash
pg_dump -U bench_admin -d bench_list_db -F c -f backup.dump
```

### Restore Database:
```bash
pg_restore -U bench_admin -d bench_list_db backup.dump
```

### Automated Daily Backups (Linux):
Create a cron job:
```bash
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * pg_dump -U bench_admin bench_list_db > /backups/bench_$(date +\%Y\%m\%d).sql
```

---

## 🔗 Additional Resources

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Django Database Settings**: https://docs.djangoproject.com/en/stable/ref/settings/#databases
- **psycopg2 Documentation**: https://www.psycopg.org/docs/

---

## ✅ Checklist

- [ ] PostgreSQL installed
- [ ] Database `bench_list_db` created
- [ ] User `bench_admin` created with privileges
- [ ] `.env` file configured with database credentials
- [ ] Python packages installed (psycopg2-binary, python-decouple)
- [ ] Migrations applied successfully
- [ ] Superuser created
- [ ] Server starts without errors
- [ ] Can access Swagger UI
- [ ] Database connection verified

---

**Your PostgreSQL database is now ready for the Employee Management System!** 🎉
