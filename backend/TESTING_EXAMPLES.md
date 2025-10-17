# Sample API Usage Examples

## Using cURL

### 1. Register a new user
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }'
```

### 2. Login to get JWT token
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepass123"
  }'
```

Save the access token from the response.

### 3. Create a company
```bash
curl -X POST http://localhost:8000/api/companies/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Tech Solutions Inc",
    "email": "contact@techsolutions.com",
    "phone": "+1234567890",
    "address": "123 Tech Street, San Francisco, CA",
    "website": "https://techsolutions.com",
    "description": "Leading software development company"
  }'
```

### 4. Create an employee
```bash
curl -X POST http://localhost:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "first_name": "John",
    "last_name": "Developer",
    "email": "john.dev@techsolutions.com",
    "phone": "+1234567891",
    "job_title": "Full Stack Developer",
    "experience_years": 3,
    "experience_level": "mid",
    "skills": "Python, Django, React, PostgreSQL, Docker",
    "company": 1,
    "status": "available",
    "bench_start_date": "2025-10-01",
    "notes": "Available for immediate projects"
  }'
```

### 5. List available employees
```bash
curl -X GET "http://localhost:8000/api/employees/available/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Create a bench request
```bash
curl -X POST http://localhost:8000/api/requests/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "employee": 1,
    "requesting_company": 2,
    "message": "We are interested in hiring this developer for a 6-month project"
  }'
```

### 7. Respond to a bench request
```bash
curl -X POST http://localhost:8000/api/requests/1/respond/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "status": "approved",
    "response": "Request approved. Please contact us at hr@techsolutions.com"
  }'
```

## Using Python requests library

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. Register and login
response = requests.post(f"{BASE_URL}/api/auth/register/", json={
    "email": "user@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "Test",
    "last_name": "User",
    "role": "company_user"
})
print(response.json())

# 2. Login
response = requests.post(f"{BASE_URL}/api/auth/login/", json={
    "email": "user@example.com",
    "password": "securepass123"
})
tokens = response.json()
access_token = tokens['access']

# 3. Use the token for authenticated requests
headers = {"Authorization": f"Bearer {access_token}"}

# Create company
response = requests.post(f"{BASE_URL}/api/companies/", 
    headers=headers,
    json={
        "name": "My Company",
        "email": "info@mycompany.com",
        "description": "A great company"
    }
)
print(response.json())

# List employees
response = requests.get(f"{BASE_URL}/api/employees/", headers=headers)
print(response.json())
```

## Using Postman

1. Create a new request collection
2. Set up an environment variable for `base_url`: `http://localhost:8000`
3. Create a POST request to `{{base_url}}/api/auth/login/`
4. Save the `access` token from response
5. In subsequent requests, add header: `Authorization: Bearer {{access_token}}`

## Testing Workflow

1. **Register two users** (for two different companies)
2. **Login with first user** and get token
3. **Create first company** using first user's token
4. **Create employees** for first company with status "available"
5. **Login with second user** and get token
6. **Create second company** using second user's token
7. **List available employees** (should see first company's employees)
8. **Create bench request** from second company for first company's employee
9. **Login as first user** again
10. **View pending requests** for first company
11. **Respond to request** (approve or reject)
12. **Check employee status** (should be "allocated" if approved)

## Tips

- Use environment variables for tokens and IDs
- Test error cases (wrong passwords, invalid data, unauthorized access)
- Check pagination on list endpoints
- Test filtering and search functionality
- Upload resume files using multipart/form-data
