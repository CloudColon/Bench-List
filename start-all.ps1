# BenchList - Start All Servers Script (PowerShell)
# This script starts PostgreSQL, Django backend, and Next.js frontend

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting BenchList Application" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $Port }
    return $null -ne $connections
}

# Function to cleanup on exit
function Cleanup {
    Write-Host ""
    Write-Host "Shutting down servers..." -ForegroundColor Yellow

    # Stop all jobs
    Get-Job | Stop-Job
    Get-Job | Remove-Job

    Write-Host "All servers stopped." -ForegroundColor Green
    exit 0
}

# Register cleanup on Ctrl+C
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

try {
    # 1. Start PostgreSQL Server
    Write-Host "[1/3] Starting PostgreSQL Server..." -ForegroundColor Blue
    if (Test-Port -Port 5432) {
        Write-Host "PostgreSQL is already running on port 5432" -ForegroundColor Yellow
    } else {
        $pgPath = "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe"
        $pgData = "C:\PostgresData"

        & $pgPath -D $pgData start

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ PostgreSQL started successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to start PostgreSQL" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host ""

    # Wait for PostgreSQL to fully start
    Start-Sleep -Seconds 2

    # 2. Start Django Backend Server
    Write-Host "[2/3] Starting Django Backend Server..." -ForegroundColor Blue

    $backendJob = Start-Job -ScriptBlock {
        Set-Location -Path $using:PWD\backend
        uv run manage.py runserver
    }

    Write-Host "✓ Django backend starting... (Job ID: $($backendJob.Id))" -ForegroundColor Green
    Write-Host ""

    # Wait for Django to start
    Start-Sleep -Seconds 3

    # 3. Start Next.js Frontend Server
    Write-Host "[3/3] Starting Next.js Frontend Server..." -ForegroundColor Blue

    $frontendJob = Start-Job -ScriptBlock {
        Set-Location -Path $using:PWD\frontend
        npm run dev
    }

    Write-Host "✓ Next.js frontend starting... (Job ID: $($frontendJob.Id))" -ForegroundColor Green
    Write-Host ""

    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "  All Servers Started Successfully!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Services:"
    Write-Host "  • PostgreSQL:  " -NoNewline; Write-Host "localhost:5432" -ForegroundColor Green
    Write-Host "  • Backend API: " -NoNewline; Write-Host "http://localhost:8000" -ForegroundColor Green
    Write-Host "  • Frontend:    " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
    Write-Host ""

    # Monitor jobs and display output
    while ($true) {
        # Display backend output
        $backendOutput = Receive-Job -Id $backendJob.Id
        if ($backendOutput) {
            $backendOutput | ForEach-Object {
                Write-Host "[Backend] " -ForegroundColor Green -NoNewline
                Write-Host $_
            }
        }

        # Display frontend output
        $frontendOutput = Receive-Job -Id $frontendJob.Id
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object {
                Write-Host "[Frontend] " -ForegroundColor Blue -NoNewline
                Write-Host $_
            }
        }

        # Check if jobs are still running
        $backendState = (Get-Job -Id $backendJob.Id).State
        $frontendState = (Get-Job -Id $frontendJob.Id).State

        if ($backendState -eq 'Failed' -or $frontendState -eq 'Failed') {
            Write-Host "One or more servers failed. Check the output above." -ForegroundColor Red
            break
        }

        Start-Sleep -Milliseconds 500
    }

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
} finally {
    Cleanup
}
