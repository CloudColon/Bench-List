# Employee Management System - Backend

This is the backend API for the Employee Management System that allows companies to register their bench employees and other companies to request and view this data.

## Features

- **Custom User Authentication**: Email and password-based authentication using JWT tokens
- **Role-based Access Control**: Admin and Company User roles
- **Company Management**: Create and manage company profiles
- **Employee Management**: Register and track bench employees with detailed information
- **Bench Request System**: Request employees from other companies
- **RESTful API**: Comprehensive API endpoints for all operations

## Technology Stack

- Django 5.2.7
- Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- SQLite Database (can be changed to PostgreSQL/MySQL)
- Python 3.14

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Database

Run migrations to set up the database:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Superuser

Create an admin user to access the Django admin panel:

```bash
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication (`/api/auth/`)

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `GET /api/auth/users/me/` - Get current user details
- `POST /api/auth/users/change_password/` - Change password

### Companies (`/api/companies/`)

- `GET /api/companies/` - List all companies
- `POST /api/companies/` - Create a new company
- `GET /api/companies/{id}/` - Get company details
- `PUT /api/companies/{id}/` - Update company
- `DELETE /api/companies/{id}/` - Delete company

### Employees (`/api/employees/`)

- `GET /api/employees/` - List all employees (with filters)
- `POST /api/employees/` - Create a new employee
- `GET /api/employees/{id}/` - Get employee details
- `PUT /api/employees/{id}/` - Update employee
- `DELETE /api/employees/{id}/` - Delete employee
- `GET /api/employees/available/` - List available bench employees

### Bench Requests (`/api/requests/`)

- `GET /api/requests/` - List all bench requests
- `POST /api/requests/` - Create a new bench request
- `GET /api/requests/{id}/` - Get request details
- `POST /api/requests/{id}/respond/` - Respond to a request (approve/reject)
- `GET /api/requests/pending/` - List pending requests

## Models

### User
- Custom user model with email as username
- Fields: email, first_name, last_name, role, is_active, date_joined
- Roles: admin, company_user

### Company
- Fields: name, email, phone, address, website, description, admin_user, is_active
- Each company is managed by a user

### Employee
- Fields: first_name, last_name, email, phone, job_title, experience_years, experience_level, skills, resume, company, status, bench_start_date, expected_availability_end, notes
- Status: available, requested, allocated
- Experience levels: junior, mid, senior, lead

### BenchRequest
- Fields: employee, requesting_company, status, message, response, requested_at, responded_at
- Status: pending, approved, rejected, cancelled

## Query Parameters

### Employees
- `status` - Filter by status (available/requested/allocated)
- `experience_level` - Filter by experience level
- `search` - Search in name, job title, and skills
- `ordering` - Order by created_at, bench_start_date, experience_years

## Authentication

All API endpoints (except registration and login) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` to manage all models through a web interface.

## Development Notes

- CORS is configured for localhost:3000 and localhost:8000
- Media files (employee resumes) are stored in the `media/` directory
- The system uses SQLite by default; update `settings.py` for production databases
- JWT tokens expire after 1 hour; refresh tokens are valid for 7 days

## Project Structure

```
backend/
├── accounts/               # User authentication and management
├── companies/              # Company management
├── employees/              # Employee and bench request management
├── employee_management/    # Main project settings
├── media/                  # Uploaded files (resumes)
├── manage.py
└── requirements.txt
```
