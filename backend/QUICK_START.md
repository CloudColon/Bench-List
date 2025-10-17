# Quick Start Guide - Employee Management System

## 🚀 Getting Started

### Prerequisites
- Python 3.14 (or 3.8+)
- Virtual environment activated

### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd d:\Github\Bench-List\backend
   ```

2. **Activate virtual environment** (if not already activated)
   ```bash
   D:\venv314\Scripts\activate.bat
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations** (already done, but if needed)
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser** (for admin access)
   ```bash
   python manage.py createsuperuser
   ```
   Use email instead of username when prompted.

6. **Start the server**
   ```bash
   python manage.py runserver
   ```
   OR use the batch file:
   ```bash
   start_server.bat
   ```

## 📍 Important URLs

- **API Base URL**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin/
- **API Endpoints**: See API_DOCUMENTATION.md

## 🔑 Key Features

### 1. User Roles
- **Admin**: Full access to all resources
- **Company User**: Access to their own company's data

### 2. Main Components
- **Users**: Email-based authentication with JWT tokens
- **Companies**: Organizations using the system
- **Employees**: Bench employees available for allocation
- **Bench Requests**: Requests from companies to hire employees

### 3. Employee Status Flow
```
Available → Requested → Allocated
```

## 📝 Common Tasks

### Create Your First Company
```bash
# 1. Register a user
POST /api/auth/register/
{
    "email": "myemail@company.com",
    "password": "secure123",
    "password2": "secure123",
    "first_name": "Your",
    "last_name": "Name",
    "role": "company_user"
}

# 2. Login to get token
POST /api/auth/login/
{
    "email": "myemail@company.com",
    "password": "secure123"
}

# 3. Create company (use token from step 2)
POST /api/companies/
Authorization: Bearer YOUR_TOKEN
{
    "name": "My Company",
    "email": "info@mycompany.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "website": "https://mycompany.com",
    "description": "Company description"
}
```

### Add Bench Employee
```bash
POST /api/employees/
Authorization: Bearer YOUR_TOKEN
{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@mycompany.com",
    "job_title": "Software Engineer",
    "experience_years": 5,
    "experience_level": "senior",
    "skills": "Python, Django, REST API",
    "company": 1,
    "status": "available",
    "bench_start_date": "2025-10-01"
}
```

### Request an Employee
```bash
POST /api/requests/
Authorization: Bearer YOUR_TOKEN
{
    "employee": 1,
    "requesting_company": 2,
    "message": "We need this employee for our project"
}
```

### Approve/Reject Request
```bash
POST /api/requests/1/respond/
Authorization: Bearer YOUR_TOKEN
{
    "status": "approved",
    "response": "Approved. Contact us at hr@company.com"
}
```

## 🔍 Useful Query Parameters

### Filter Employees
- By status: `GET /api/employees/?status=available`
- By experience: `GET /api/employees/?experience_level=senior`
- Search: `GET /api/employees/?search=python`
- Combined: `GET /api/employees/?status=available&experience_level=senior&search=django`

### Ordering
- Latest first: `GET /api/employees/?ordering=-created_at`
- By experience: `GET /api/employees/?ordering=experience_years`

## 🛠️ Development Commands

```bash
# Check for issues
python manage.py check

# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests (if you add them)
python manage.py test

# Start development server
python manage.py runserver

# Start on different port
python manage.py runserver 8080

# Collect static files (for production)
python manage.py collectstatic
```

## 📊 Project Structure

```
backend/
├── accounts/               # User authentication & management
│   ├── models.py          # Custom User model
│   ├── serializers.py     # User serializers
│   ├── views.py           # Auth views
│   ├── urls.py            # Auth endpoints
│   └── admin.py           # User admin
├── companies/             # Company management
│   ├── models.py          # Company model
│   ├── serializers.py     # Company serializers
│   ├── views.py           # Company views
│   ├── urls.py            # Company endpoints
│   └── admin.py           # Company admin
├── employees/             # Employee & request management
│   ├── models.py          # Employee & BenchRequest models
│   ├── serializers.py     # Employee serializers
│   ├── views.py           # Employee views
│   ├── urls.py            # Employee endpoints
│   └── admin.py           # Employee admin
├── employee_management/   # Main project settings
│   ├── settings.py        # Django settings
│   ├── urls.py            # Main URL config
│   └── wsgi.py            # WSGI config
├── media/                 # Uploaded files (resumes)
├── manage.py              # Django management script
├── db.sqlite3             # SQLite database
├── requirements.txt       # Python dependencies
├── README.md              # Main documentation
├── API_DOCUMENTATION.md   # Detailed API docs
├── TESTING_EXAMPLES.md    # Testing examples
├── QUICK_START.md         # This file
└── start_server.bat       # Quick start script
```

## 🐛 Troubleshooting

### Issue: "django not found"
**Solution**: Make sure virtual environment is activated
```bash
D:\venv314\Scripts\activate.bat
```

### Issue: "No module named 'rest_framework'"
**Solution**: Install dependencies
```bash
pip install -r requirements.txt
```

### Issue: "Authentication credentials were not provided"
**Solution**: Include Authorization header
```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Issue: Token expired
**Solution**: Use refresh token to get new access token
```bash
POST /api/auth/token/refresh/
{
    "refresh": "YOUR_REFRESH_TOKEN"
}
```

## 📚 Additional Resources

- **Django Documentation**: https://docs.djangoproject.com/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **JWT Authentication**: https://django-rest-framework-simplejwt.readthedocs.io/

## 🎯 Next Steps

1. ✅ Create superuser for admin access
2. ✅ Test API endpoints using Postman or cURL
3. ✅ Register companies and add employees
4. ✅ Test bench request workflow
5. 🔄 Connect with frontend application
6. 🔄 Deploy to production server

## 💡 Tips

- Always use HTTPS in production
- Change SECRET_KEY in settings.py for production
- Use PostgreSQL or MySQL for production (not SQLite)
- Set DEBUG=False in production
- Configure proper CORS settings for your frontend domain
- Implement rate limiting for API endpoints
- Add logging for production monitoring
- Regular database backups

## 📞 Support

For issues or questions:
1. Check API_DOCUMENTATION.md for endpoint details
2. Review TESTING_EXAMPLES.md for usage examples
3. Check Django admin panel at http://localhost:8000/admin/
4. Enable DEBUG mode to see detailed error messages (development only)

---

**Happy Coding! 🚀**
