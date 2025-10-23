# BenchList Frontend

A modern Next.js frontend application for the BenchList employee bench management platform. This application provides an intuitive interface for managing and sharing bench employee availability across companies.

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State Management**: React Context API
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- Backend API running on `http://localhost:8000` (see `../backend` folder)

## 🛠️ Installation

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables) section)

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the frontend root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: For server-side API calls
API_URL=http://localhost:8000
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── dashboard/           # Dashboard page
│   ├── employees/           # Employee management pages
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.js            # Root layout component
│   └── page.js              # Home page
├── components/              # Reusable React components
├── contexts/                # React Context providers
│   └── AuthContext.js       # Authentication context
├── lib/                     # Utility libraries
│   └── api.js               # API client and endpoints
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── .eslintrc.json          # ESLint configuration
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.js       # PostCSS configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## ✨ Features

### Authentication
- ✅ User registration with role selection
- ✅ Login with JWT authentication
- ✅ Auto token refresh
- ✅ Protected routes
- ✅ Persistent session

### Employee Management
- ✅ List all bench employees with pagination
- ✅ Filter by status, experience level
- ✅ Search functionality
- ✅ View detailed employee profiles
- ✅ Add new employees
- ✅ Update employee information
- ✅ Upload resumes

### Dashboard
- ✅ Overview statistics
- ✅ Employee status distribution
- ✅ Recent employees list
- ✅ Pending requests summary
- ✅ Quick action shortcuts

### Request Management
- ✅ Browse available employees
- ✅ Submit hiring requests
- ✅ Review pending requests
- ✅ Approve/reject requests

### Company Management
- ✅ List all companies
- ✅ Add new companies
- ✅ View company details
- ✅ Update company information

## 🔌 API Integration

The application integrates with the Django REST backend via Axios. All API calls are centralized in `lib/api.js`.

### API Endpoints Used

- **Authentication**
  - POST `/api/auth/register/` - Register new user
  - POST `/api/auth/login/` - User login
  - POST `/api/auth/token/refresh/` - Refresh access token
  - GET `/api/auth/users/me/` - Get current user

- **Employees**
  - GET `/api/employees/` - List employees
  - GET `/api/employees/:id/` - Get employee details
  - GET `/api/employees/available/` - Get available employees
  - POST `/api/employees/` - Create employee
  - PUT/PATCH `/api/employees/:id/` - Update employee

- **Companies**
  - GET `/api/companies/` - List companies
  - GET `/api/companies/:id/` - Get company details
  - POST `/api/companies/` - Create company
  - PUT/PATCH `/api/companies/:id/` - Update company

- **Requests**
  - GET `/api/requests/` - List requests
  - GET `/api/requests/pending/` - Get pending requests
  - POST `/api/requests/` - Create request
  - POST `/api/requests/:id/respond/` - Respond to request

### Authentication Flow

1. User logs in with credentials
2. Backend returns access and refresh tokens
3. Tokens stored in localStorage
4. Access token sent in Authorization header for all requests
5. Auto-refresh when access token expires
6. Redirect to login if refresh fails

## 🎨 Styling

### Tailwind CSS

The application uses Tailwind CSS for styling with custom configurations:

- **Custom Colors**: Primary color palette (blue shades)
- **Custom Components**: Buttons, inputs, cards, badges
- **Responsive Design**: Mobile-first approach
- **Dark Mode Ready**: Structure supports dark mode (can be enabled)

### Global Styles

Custom CSS classes are defined in `app/globals.css`:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.input`
- `.card`
- `.badge-*` (status indicators)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1280px+)

## 🔒 Security

- JWT-based authentication
- Secure token storage (localStorage)
- Automatic token refresh
- Protected routes (client-side)
- Input validation and sanitization
- CORS handling

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

### Build Configuration

Ensure your deployment platform:
- Uses Node.js 18+
- Runs `npm run build`
- Serves from `.next` directory
- Sets environment variables

## 🐛 Troubleshooting

### Common Issues

**API Connection Failed**
- Ensure backend is running on the correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS settings in backend

**Authentication Errors**
- Clear localStorage and try logging in again
- Check token expiration settings
- Verify backend JWT configuration

**Build Errors**
- Delete `.next` folder and rebuild
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is part of the BenchList platform.

## 🔗 Related

- [Backend Repository](../backend) - Django REST API
- [API Documentation](../backend/API_DOCUMENTATION.md)

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

---

Built with ❤️ using Next.js and Tailwind CSS