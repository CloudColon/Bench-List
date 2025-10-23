# Bench List - Employee Management System

A full-stack application for managing bench employees and inter-company employee allocation requests.

## Stack

### Backend
- **Language:** Python 3.14
- **Framework:** Django 5.2.7 with Django REST Framework
- **Authentication:** JWT (JSON Web Tokens) via rest_framework_simplejwt
- **Database:** PostgreSQL 15+
- **Documentation:** Swagger/OpenAPI via drf-yasg

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** React Context API

## Project Structure

```
Bench-List/
├── backend/              # Django backend API
│   ├── main/            # Main Django project settings
│   ├── accounts/        # User authentication and management
│   ├── companies/       # Company management
│   ├── employees/       # Employee and bench request management
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/            # Next.js frontend
    ├── app/            # Next.js app directory
    ├── lib/            # API utilities and helpers
    ├── contexts/       # React contexts
    └── package.json
```

## Prerequisites

- **Python:** 3.10+ (preferably 3.14)
- **Node.js:** 18+
- **npm or yarn:** Latest version
- **PostgreSQL:** 15+ (required)

## Setup Instructions

### 1. PostgreSQL Database Setup

#### a. Install PostgreSQL
Download and install PostgreSQL 15+ from [postgresql.org](https://www.postgresql.org/download/)

#### b. Create the database
After installing PostgreSQL, you have two options:

**Option 1: Using the provided SQL script**
```bash
# Windows (Command Prompt or PowerShell)
psql -U postgres -f backend\setup_database.sql

# Linux/Mac
psql -U postgres -f backend/setup_database.sql
```

**Option 2: Manual setup via psql**
```bash
# Connect to PostgreSQL
psql -U postgres

# Run these commands in psql:
CREATE DATABASE bench_list_db;
CREATE USER bench_admin WITH PASSWORD 'change_this_password';
GRANT ALL PRIVILEGES ON DATABASE bench_list_db TO bench_admin;
\c bench_list_db
GRANT ALL ON SCHEMA public TO bench_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bench_admin;
\q
```

**Option 3: Using pgAdmin**
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `bench_list_db`
4. Right-click on "Login/Group Roles" → "Create" → "Login/Group Role"
5. Name: `bench_admin`, set password, grant privileges

#### c. Update database credentials
Edit `backend/.env` file and update the PostgreSQL password:
```
DB_PASSWORD=your_actual_password_here
```

### 2. Backend Setup

#### a. Navigate to backend directory
```bash
cd backend
```

#### b. Create and activate virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

#### c. Install dependencies
```bash
pip install -r requirements.txt
```

#### d. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### e. Create superuser (optional but recommended)
```bash
python manage.py createsuperuser
```

#### f. Start the backend server
```bash
python manage.py runserver
```

The backend will be available at:
- **API:** http://localhost:8000
- **Swagger Documentation:** http://localhost:8000/swagger/
- **Admin Panel:** http://localhost:8000/admin/

### 3. Frontend Setup

#### a. Open a new terminal and navigate to frontend directory
```bash
cd frontend
```

#### b. Install dependencies
```bash
npm install
# or
yarn install
```

#### c. Verify environment variables
The `.env.local` file is already configured to connect to the backend at `http://localhost:8000`. No changes needed for local development.

#### d. Start the frontend server
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at:
- **Application:** http://localhost:3000

## Running Both Servers

To run the full application, you need both servers running simultaneously:

1. **Terminal 1 (Backend):**
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   python manage.py runserver
   ```

2. **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/users/me/` - Get current user info

### Companies
- `GET /api/companies/` - List all companies
- `POST /api/companies/` - Create a new company
- `GET /api/companies/{id}/` - Get company details
- `PUT /api/companies/{id}/` - Update company
- `DELETE /api/companies/{id}/` - Delete company

### Employees
- `GET /api/employees/` - List all employees
- `POST /api/employees/` - Create a new employee
- `GET /api/employees/{id}/` - Get employee details
- `PUT /api/employees/{id}/` - Update employee
- `DELETE /api/employees/{id}/` - Delete employee
- `GET /api/employees/available/` - Get available bench employees

### Bench Requests
- `GET /api/requests/` - List all requests
- `POST /api/requests/` - Create a new bench request
- `GET /api/requests/{id}/` - Get request details
- `POST /api/requests/{id}/respond/` - Respond to a request
- `DELETE /api/requests/{id}/` - Delete request

## Configuration Details

### Backend CORS Settings
The backend is configured to accept requests from:
- http://localhost:3000 (frontend)
- http://localhost:8000 (backend)
- http://127.0.0.1:3000
- http://127.0.0.1:8000

Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

### Frontend API Configuration
The frontend automatically includes JWT tokens in all requests via axios interceptors. Tokens are stored in localStorage and automatically refreshed when expired.

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'rest_framework'`
**Solution:** Ensure virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

**Problem:** `django.db.utils.OperationalError: could not connect to server`
**Solution:**
1. Ensure PostgreSQL is running
2. Check credentials in `backend/.env`
3. Verify database exists: `psql -U postgres -l`
4. Test connection: `psql -U bench_admin -d bench_list_db`

**Problem:** `django.db.utils.OperationalError: FATAL: password authentication failed`
**Solution:** Update the password in `backend/.env` to match your PostgreSQL user password

**Problem:** `relation "table_name" does not exist`
**Solution:** Run migrations:
```bash
python manage.py migrate
```

**Problem:** Permission denied errors in PostgreSQL
**Solution:** Grant proper permissions:
```sql
psql -U postgres
\c bench_list_db
GRANT ALL ON SCHEMA public TO bench_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bench_admin;
```

### Frontend Issues

**Problem:** `Cannot connect to backend`
**Solution:**
1. Verify backend is running on http://localhost:8000
2. Check `.env.local` has correct API URL
3. Check browser console for CORS errors

**Problem:** `Module not found` errors
**Solution:** Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

**Problem:** CORS errors in browser console
**Solution:** Backend CORS settings have been configured to allow all necessary headers and methods. If issues persist:
1. Verify backend `.env` has correct CORS_ALLOWED_ORIGINS
2. Clear browser cache
3. Restart both servers

## Database Verification

To verify your PostgreSQL database is set up correctly:

```bash
# Check if database exists
psql -U postgres -l | grep bench_list_db

# Connect to the database
psql -U bench_admin -d bench_list_db

# Inside psql, check tables (after running migrations)
\dt

# Check database size and connections
SELECT pg_size_pretty(pg_database_size('bench_list_db'));
```

## Development Workflow

1. **Ensure PostgreSQL is running:** Check PostgreSQL service is active
2. **Start Backend:** Run Django server first to ensure API is available
3. **Start Frontend:** Run Next.js dev server
4. **Access Application:** Navigate to http://localhost:3000
5. **API Documentation:** Visit http://localhost:8000/swagger/ for interactive API docs
6. **Admin Panel:** Visit http://localhost:8000/admin/ to manage data
7. **Test Authentication:** Register a user and test login functionality

## Features

- ✅ User authentication with JWT tokens
- ✅ Automatic token refresh
- ✅ Company management
- ✅ Employee management with status tracking
- ✅ Bench request system
- ✅ Role-based access control
- ✅ API documentation with Swagger
- ✅ Responsive UI with Tailwind CSS

## License

MIT
