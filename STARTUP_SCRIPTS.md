# BenchList Startup Scripts

This directory contains scripts to easily start and stop all BenchList application servers.

## Available Scripts

### Windows (Recommended)

#### `start-all.bat` - Start All Servers
Double-click this file or run from command prompt:
```batch
start-all.bat
```

This will:
1. Start PostgreSQL server (if not already running)
2. Start Django backend server on http://localhost:8000
3. Start Next.js frontend server on http://localhost:3000

Each service runs in its own terminal window for easy monitoring.

#### `stop-all.bat` - Stop All Servers
Double-click this file or run from command prompt:
```batch
stop-all.bat
```

This will stop all running BenchList servers.

### PowerShell (Alternative)

#### `start-all.ps1` - Advanced PowerShell Script
Run from PowerShell:
```powershell
.\start-all.ps1
```

Features:
- Real-time output from all servers in a single window
- Color-coded output (Backend in green, Frontend in blue)
- Automatic cleanup on Ctrl+C
- Job-based background execution

**Note:** You may need to enable script execution:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Bash/Git Bash

#### `start-all.sh` - Bash Script
Run from Git Bash or WSL:
```bash
bash start-all.sh
```

Features:
- Color-coded output
- Automatic cleanup on Ctrl+C
- Port availability checking

**Note:** Make the script executable first:
```bash
chmod +x start-all.sh
```

## Services and Ports

When all servers are running, you can access:

| Service    | URL                      | Port |
|------------|--------------------------|------|
| Frontend   | http://localhost:3000    | 3000 |
| Backend    | http://localhost:8000    | 8000 |
| PostgreSQL | localhost                | 5432 |

## Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
1. Run `stop-all.bat` to stop all services
2. Or manually kill the processes:
   ```batch
   netstat -ano | findstr ":3000"
   netstat -ano | findstr ":8000"
   taskkill /F /PID <PID_NUMBER>
   ```

### PostgreSQL Won't Start
1. Check if PostgreSQL service is running in Windows Services
2. Verify the data directory path: `C:\PostgresData`
3. Check PostgreSQL logs in: `C:\PostgresData\log\`

### Django Backend Errors
1. Make sure the virtual environment is activated
2. Check if all dependencies are installed:
   ```batch
   cd backend
   uv pip install -r requirements.txt
   ```
3. Run migrations:
   ```batch
   uv run manage.py migrate
   ```

### Frontend Errors
1. Make sure Node.js dependencies are installed:
   ```batch
   cd frontend
   npm install
   ```
2. Clear the Next.js cache:
   ```batch
   npm run build
   ```

## Manual Start (Alternative)

If you prefer to start services manually:

### 1. PostgreSQL
```batch
"C:\Program Files\PostgreSQL\17\bin\pg_ctl" -D "C:\PostgresData" start
```

### 2. Django Backend
```batch
cd backend
uv run manage.py runserver
```

### 3. Next.js Frontend
```batch
cd frontend
npm run dev
```

## Development Tips

- Use `start-all.bat` for quick development startup
- Each service runs in its own window, so you can see logs easily
- Use Ctrl+C in each window to stop that specific service
- Use `stop-all.bat` to stop everything at once
