# Quick PostgreSQL Setup - Employee Management System

## ✅ What's Been Configured

PostgreSQL support has been successfully added to your Employee Management System!

### 📦 Packages Installed
- ✅ `psycopg2-binary` - PostgreSQL adapter for Python
- ✅ `python-decouple` - Environment variable management
- ✅ `python-dotenv` - Load environment variables from .env

### 📁 Files Created/Updated
- ✅ `.env` - Environment variables (with PostgreSQL config)
- ✅ `.env.example` - Example environment file for team
- ✅ `settings.py` - Updated to support PostgreSQL and environment variables
- ✅ `.gitignore` - Updated to never commit .env file
- ✅ `requirements.txt` - Updated with new packages
- ✅ `POSTGRESQL_SETUP.md` - Complete PostgreSQL setup guide

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install PostgreSQL

**Download and install:** https://www.postgresql.org/download/

Remember the password you set for the `postgres` user!

### Step 2: Create Database

Open command prompt or PowerShell and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql, run these commands:
CREATE DATABASE bench_list_db;
CREATE USER bench_admin WITH PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE bench_list_db TO bench_admin;
\q
```

### Step 3: Update .env File

Edit `backend/.env`:

```env
USE_POSTGRES=True
DB_PASSWORD=change_this_password
```

(Change `change_this_password` to the password you used in Step 2)

### Step 4: Run Migrations

```bash
cd d:\Github\Bench-List\backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Done!** Visit http://localhost:8000/swagger/

---

## 🔄 Switch Between Databases

### Use PostgreSQL:
In `.env` file:
```env
USE_POSTGRES=True
```

### Use SQLite (for testing):
In `.env` file:
```env
USE_POSTGRES=False
```

No code changes needed! Just change the environment variable.

---

## 📚 Full Documentation

For detailed setup instructions, see: **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)**

It includes:
- ✅ Complete installation guide (Windows/Mac/Linux)
- ✅ Database creation with psql or pgAdmin
- ✅ Security best practices
- ✅ Troubleshooting common issues
- ✅ Backup and restore procedures
- ✅ PostgreSQL commands reference

---

## 🎯 Why PostgreSQL?

Your Employee Management Platform benefits from PostgreSQL because:

1. **Concurrent Access** ✅
   - Multiple companies accessing data simultaneously
   - No database locking issues

2. **Production-Ready** ✅
   - Industry-standard for web applications
   - Used by companies like Instagram, Spotify, Reddit

3. **Advanced Features** ✅
   - Full-text search for employee skills
   - Better indexing for faster queries
   - JSON fields for flexible data

4. **Scalability** ✅
   - Handles thousands of employees and requests
   - Easy to scale horizontally

5. **Data Integrity** ✅
   - Better transaction support
   - Proper foreign key enforcement

---

## ⚙️ Environment Variables Reference

Your `.env` file controls all configuration:

```env
# Django Settings
DEBUG=True                    # Set to False in production
SECRET_KEY=your-secret-key    # Generate a new one for production

# Database
USE_POSTGRES=True             # True = PostgreSQL, False = SQLite
DB_NAME=bench_list_db         # Database name
DB_USER=bench_admin           # Database user
DB_PASSWORD=your_password     # Your PostgreSQL password
DB_HOST=localhost             # Database host
DB_PORT=5432                  # PostgreSQL port

# Security
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# JWT Tokens
JWT_ACCESS_TOKEN_LIFETIME_HOURS=1
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

---

## 🔐 Security Notes

**IMPORTANT:** The `.env` file is automatically excluded from Git!

- ✅ Never commit `.env` file
- ✅ Use `.env.example` for team reference
- ✅ Generate unique SECRET_KEY for production
- ✅ Use strong database passwords
- ✅ Set DEBUG=False in production

---

## 🐛 Troubleshooting

### Can't connect to PostgreSQL?

```bash
# Check if PostgreSQL is running
# Windows: Services → PostgreSQL
# Or try:
psql -U postgres

# If password fails, reset it:
# Open psql as superuser and run:
ALTER USER bench_admin WITH PASSWORD 'new_password';
```

### Migration errors?

```bash
# Check database connection
python manage.py dbshell

# If that works, try:
python manage.py migrate --run-syncdb
```

### Still using SQLite?

Check your `.env` file:
```env
USE_POSTGRES=True  # Must be True (not true or TRUE)
```

---

## 📊 Verify Setup

Run these commands to verify PostgreSQL is working:

```bash
# Check database connection
python manage.py dbshell

# In the PostgreSQL prompt:
\dt           # List all tables
\du           # List users
\l            # List databases
\q            # Quit

# Run Django check
python manage.py check
```

---

## 🎉 Next Steps

1. ✅ Follow the 3-step quick start above
2. ✅ Read [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md) for details
3. ✅ Test your API at http://localhost:8000/swagger/
4. ✅ Configure backups for production

---

## 📞 Need Help?

- **Setup Issues**: See [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)
- **API Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Swagger Guide**: See [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md)
- **Quick Start**: See [QUICK_START.md](QUICK_START.md)

---

**Your Employee Management System is now configured for PostgreSQL!** 🚀

Switch databases anytime by changing `USE_POSTGRES` in your `.env` file.
