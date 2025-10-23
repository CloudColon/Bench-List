# BenchList Frontend - Quick Start Guide

Get up and running with the BenchList frontend in minutes!

## 🚀 Quick Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 3: Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

## ✅ First Steps

### 1. Start the Backend API

Make sure your Django backend is running first:

```bash
cd ../backend
python manage.py runserver
```

The backend should be running at `http://localhost:8000`

### 2. Open the Frontend

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Create an Account

1. Click **Register** button
2. Fill in the registration form:
   - First Name
   - Last Name
   - Email
   - Password (min. 8 characters)
   - Confirm Password
   - Select Role (Company User or Admin)
3. Click **Create account**
4. You'll be automatically logged in and redirected to the dashboard

### 4. Explore the Dashboard

After logging in, you'll see:
- 📊 **Statistics cards** - Overview of employees, requests, and companies
- 📋 **Recent activities** - Latest employees and pending requests
- ⚡ **Quick actions** - Shortcuts to common tasks

### 5. Add Your First Employee

1. Click **Add Employee** from the dashboard or navigation
2. Fill in employee details:
   - Personal info (name, email, phone)
   - Job title and experience
   - Skills
   - Status (Available, Requested, Allocated)
   - Bench dates
3. Click **Save**

## 🔑 Test Credentials (Development)

If your backend has seed data:

```
Email: admin@example.com
Password: admin123
```

## 📱 Key Features to Try

### Employee Management
- **Browse Employees**: `/employees` - View all bench employees
- **Filter & Search**: Use filters to find specific employees
- **View Details**: Click on any employee card
- **Add Employee**: `/employees/add` - Add new bench employee

### Company Management
- **View Companies**: `/companies` - See all registered companies
- **Add Company**: `/companies/add` - Register a new company

### Request System
- **View Requests**: `/requests` - See all hiring requests
- **Create Request**: Click "Request" on available employees
- **Respond to Requests**: Approve or reject pending requests

### Dashboard
- **Overview**: `/dashboard` - See statistics and recent activity
- **Quick Actions**: Access common tasks quickly

## 🔧 Common Issues & Solutions

### ❌ "API Connection Failed"

**Problem**: Frontend can't reach the backend API

**Solution**:
1. Check backend is running: `http://localhost:8000`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check for CORS issues in backend settings

### ❌ "Authentication Error"

**Problem**: Login not working

**Solution**:
1. Clear browser localStorage
2. Make sure backend JWT settings are correct
3. Try registering a new account

### ❌ Module Not Found Errors

**Problem**: Import errors during development

**Solution**:
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### ❌ Port 3000 Already in Use

**Problem**: Another app is using port 3000

**Solution**:
```bash
# Use a different port
PORT=3001 npm run dev
```

Or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

## 🎯 Development Workflow

1. **Start Backend**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Frontend** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Make Changes**
   - Edit files in `app/`, `components/`, etc.
   - Changes auto-reload in browser
   - Check browser console for errors

4. **Test Changes**
   - Test in browser at `localhost:3000`
   - Check Network tab for API calls
   - Verify responsive design (mobile/tablet/desktop)

## 📚 Project Structure Reference

```
frontend/
├── app/                    # Pages (Next.js App Router)
│   ├── page.js            # Home page
│   ├── dashboard/         # Dashboard
│   ├── employees/         # Employee pages
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # Reusable components
│   ├── Navigation.js      # Nav bar
│   └── Loading.js         # Loading spinner
├── contexts/              # React contexts
│   └── AuthContext.js     # Auth state
├── lib/                   # Utilities
│   └── api.js             # API client
└── public/                # Static files
```

## 🌐 API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Register user |
| `/api/auth/login/` | POST | Login |
| `/api/auth/users/me/` | GET | Get current user |
| `/api/employees/` | GET | List employees |
| `/api/employees/` | POST | Create employee |
| `/api/companies/` | GET | List companies |
| `/api/requests/` | GET | List requests |

**Full API docs**: See `backend/API_DOCUMENTATION.md`

## 🎨 Customization

### Change Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Change these values
        500: '#0ea5e9',
        600: '#0284c7',
        // ...
      },
    },
  },
}
```

### Add Custom Styles

Edit `app/globals.css`:

```css
@layer components {
  .my-custom-class {
    @apply bg-blue-500 text-white p-4;
  }
}
```

## 🚢 Ready for Production?

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables for Production

Update `.env.local` with production API URL:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📖 Next Steps

- Read the full [README.md](./README.md)
- Check [API Documentation](../backend/API_DOCUMENTATION.md)
- Review [Backend Setup](../backend/QUICK_START.md)
- Explore Next.js docs: https://nextjs.org/docs

## 💡 Tips

- Use **React DevTools** browser extension for debugging
- Check **Network tab** in browser DevTools for API issues
- Use **Console** for JavaScript errors
- Hot reload might fail - restart dev server if needed
- Clear cache if styles don't update: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## 🆘 Need Help?

- Check browser console for errors
- Check terminal for build errors
- Review API_DOCUMENTATION.md for endpoint details
- Ensure backend and frontend versions match
- Try clearing browser cache and localStorage

---

**Happy Coding! 🎉**