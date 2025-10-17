# Swagger API Documentation Guide

## 🎯 Overview

Swagger UI has been successfully integrated into your Employee Management System. You can now test all API endpoints through an interactive web interface!

## 📍 Access URLs

Once the server is running, you can access:

### **Swagger UI (Interactive API Testing)**
🔗 **http://localhost:8000/swagger/**
- Interactive API documentation
- Test endpoints directly from the browser
- See request/response examples
- Try out API calls with real data

### **ReDoc (Alternative Documentation)**
🔗 **http://localhost:8000/redoc/**
- Clean, readable API documentation
- Better for reading and understanding the API
- Three-panel design with examples

### **OpenAPI Schema (JSON/YAML)**
🔗 **http://localhost:8000/swagger.json**
🔗 **http://localhost:8000/swagger.yaml**
- Raw OpenAPI specification
- Use for importing into other tools (Postman, Insomnia)

### **Root URL**
🔗 **http://localhost:8000/**
- Now redirects to Swagger UI by default
- Quick access to API documentation

## 🚀 How to Use Swagger UI

### Step 1: Start the Server
```bash
python manage.py runserver
```

### Step 2: Open Swagger UI
Navigate to: **http://localhost:8000/swagger/**

### Step 3: Register a User (No Auth Required)
1. Find the **`POST /api/auth/register/`** endpoint
2. Click on it to expand
3. Click **"Try it out"**
4. Edit the request body:
```json
{
  "email": "test@example.com",
  "password": "testpass123",
  "password2": "testpass123",
  "first_name": "Test",
  "last_name": "User",
  "role": "company_user"
}
```
5. Click **"Execute"**
6. Check the response below

### Step 4: Login to Get JWT Token
1. Find the **`POST /api/auth/login/`** endpoint
2. Click **"Try it out"**
3. Enter credentials:
```json
{
  "email": "test@example.com",
  "password": "testpass123"
}
```
4. Click **"Execute"**
5. **Copy the `access` token** from the response

### Step 5: Authorize Swagger
1. Click the **"Authorize" button** 🔒 at the top right of the page
2. In the popup, enter: `Bearer <your_access_token>`
   - Example: `Bearer eyJ0eXAiOiJKV1QiLCJhbGc...`
3. Click **"Authorize"**
4. Click **"Close"**

### Step 6: Test Authenticated Endpoints
Now you can test all endpoints! For example:

#### Create a Company
1. Find **`POST /api/companies/`**
2. Click **"Try it out"**
3. Enter data:
```json
{
  "name": "My Tech Company",
  "email": "info@mytech.com",
  "phone": "+1234567890",
  "address": "123 Tech St",
  "website": "https://mytech.com",
  "description": "A great tech company"
}
```
4. Click **"Execute"**
5. Note the `id` in the response (you'll need it for creating employees)

#### Create an Employee
1. Find **`POST /api/employees/`**
2. Click **"Try it out"**
3. Enter data (use the company `id` from above):
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@mytech.com",
  "phone": "+1234567891",
  "job_title": "Software Engineer",
  "experience_years": 5,
  "experience_level": "senior",
  "skills": "Python, Django, React",
  "company": 1,
  "status": "available",
  "bench_start_date": "2025-10-01",
  "notes": "Available for projects"
}
```
4. Click **"Execute"**

#### List Available Employees
1. Find **`GET /api/employees/available/`**
2. Click **"Try it out"**
3. Click **"Execute"**
4. See all available bench employees

## 🔑 API Endpoints in Swagger

### Authentication (`/api/auth/`)
- ✅ `POST /api/auth/register/` - Register new user (No auth)
- ✅ `POST /api/auth/login/` - Login and get JWT token (No auth)
- ✅ `POST /api/auth/token/refresh/` - Refresh JWT token (No auth)
- 🔒 `GET /api/auth/users/` - List users
- 🔒 `GET /api/auth/users/me/` - Get current user
- 🔒 `POST /api/auth/users/change_password/` - Change password

### Companies (`/api/companies/`)
- 🔒 `GET /api/companies/` - List companies
- 🔒 `POST /api/companies/` - Create company
- 🔒 `GET /api/companies/{id}/` - Get company details
- 🔒 `PUT /api/companies/{id}/` - Update company
- 🔒 `PATCH /api/companies/{id}/` - Partial update
- 🔒 `DELETE /api/companies/{id}/` - Delete company

### Employees (`/api/employees/`)
- 🔒 `GET /api/employees/` - List employees (with filters)
- 🔒 `POST /api/employees/` - Create employee
- 🔒 `GET /api/employees/{id}/` - Get employee details
- 🔒 `PUT /api/employees/{id}/` - Update employee
- 🔒 `PATCH /api/employees/{id}/` - Partial update
- 🔒 `DELETE /api/employees/{id}/` - Delete employee
- 🔒 `GET /api/employees/available/` - List available employees

### Bench Requests (`/api/requests/`)
- 🔒 `GET /api/requests/` - List bench requests
- 🔒 `POST /api/requests/` - Create bench request
- 🔒 `GET /api/requests/{id}/` - Get request details
- 🔒 `PUT /api/requests/{id}/` - Update request
- 🔒 `PATCH /api/requests/{id}/` - Partial update
- 🔒 `DELETE /api/requests/{id}/` - Delete request
- 🔒 `POST /api/requests/{id}/respond/` - Respond to request
- 🔒 `GET /api/requests/pending/` - List pending requests

✅ = No authentication required
🔒 = JWT authentication required

## 💡 Tips & Tricks

### Testing Query Parameters
For endpoints like `GET /api/employees/`:
1. Click **"Try it out"**
2. Fill in optional parameters:
   - `status`: available, requested, or allocated
   - `experience_level`: junior, mid, senior, or lead
   - `search`: search term
   - `ordering`: created_at, -created_at, etc.
   - `page`: page number
3. Click **"Execute"**

### Token Expiration
- Access tokens expire after **1 hour**
- If you get 401 errors, your token expired
- Use the `/api/auth/token/refresh/` endpoint
- Or login again to get a new token

### Testing with Multiple Users
1. Open Swagger in an **incognito/private window**
2. Register and login as a different user
3. Test interactions between companies
4. Create bench requests between companies

### Downloading OpenAPI Spec
1. Click **"GET /swagger.json"** at the top
2. Import into Postman, Insomnia, or other tools
3. Or use the YAML version: **GET /swagger.yaml**

### Response Codes
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: No permission
- **404 Not Found**: Resource doesn't exist

## 🧪 Complete Testing Workflow

### Scenario: Two companies requesting employees

**Company A (Tech Solutions)**
1. Register user: admin@techsolutions.com
2. Login and get token
3. Authorize in Swagger
4. Create company: Tech Solutions
5. Create employee: Senior Developer (status: available)

**Company B (Digital Corp)**
1. **Open new incognito window**
2. Go to http://localhost:8000/swagger/
3. Register user: admin@digitalcorp.com
4. Login and get token
5. Authorize in Swagger
6. Create company: Digital Corp
7. View available employees (should see Tech Solutions' employee)
8. Create bench request for that employee

**Back to Company A**
1. Refresh your first window
2. View pending requests
3. Respond to the request (approve/reject)
4. Check employee status (should be "allocated" if approved)

## 🎨 Swagger UI Features

### 1. Models Section
- Scroll to bottom of Swagger UI
- See all data models and their schemas
- Understand required fields and data types

### 2. Try It Out
- Interactive testing right in the browser
- No need for Postman or cURL

### 3. Example Values
- Click on any model to see example data
- Auto-fills request bodies

### 4. Response Documentation
- See all possible response codes
- Example responses for each code

### 5. Download Client SDK
- Export OpenAPI spec
- Generate client libraries in various languages

## 🐛 Troubleshooting

### Issue: "Failed to fetch"
**Solution**: Make sure the server is running
```bash
python manage.py runserver
```

### Issue: 401 Unauthorized on protected endpoints
**Solution**: 
1. Make sure you clicked "Authorize" 
2. Token should be: `Bearer <token>` (with space)
3. Token might be expired - login again

### Issue: Can't see my company/employees
**Solution**: Users can only see their own companies' data (unless admin role)

### Issue: CORS errors
**Solution**: Already configured for localhost. For other domains, update CORS_ALLOWED_ORIGINS in settings.py

## 📚 Additional Resources

- **Swagger Official Docs**: https://swagger.io/docs/
- **drf-yasg GitHub**: https://github.com/axnsan12/drf-yasg
- **OpenAPI Specification**: https://spec.openapis.org/oas/latest.html

## 🎯 Next Steps

1. ✅ Test all endpoints in Swagger UI
2. ✅ Create sample data for testing
3. ✅ Test the complete workflow
4. ✅ Export OpenAPI spec for frontend team
5. ✅ Share Swagger URL with your team

---

**Happy Testing! 🚀**

Access Swagger at: **http://localhost:8000/swagger/**
