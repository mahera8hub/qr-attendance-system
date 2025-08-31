# PowerShell script to deploy both frontend and backend to Vercel

Write-Host "=== QR Attendance System Vercel Deployment Script ===" -ForegroundColor Cyan

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "Vercel CLI detected: $vercelVersion" -ForegroundColor Green
}
catch {
    Write-Host "Vercel CLI not found. Please install it with: npm install -g vercel" -ForegroundColor Red
    exit 1
}

# Deploy Backend
Write-Host "`nDeploying Backend..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray

# Ask for confirmation before deploying backend
$confirmBackend = Read-Host "Deploy backend to Vercel? (y/n)"
if ($confirmBackend -eq "y") {
    Write-Host "Running 'vercel --prod' for backend..." -ForegroundColor Yellow
    vercel --prod
    
    # Get the backend URL
    $backendUrl = Read-Host "Enter the deployed backend URL (e.g., https://qr-attendance-system-backend.vercel.app)"
    
    # Deploy Frontend
    Write-Host "`nDeploying Frontend..." -ForegroundColor Yellow
    Set-Location -Path "$PSScriptRoot\frontend"
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
    
    # Update the .env file with the backend URL
    Write-Host "Updating .env file with backend URL: $backendUrl" -ForegroundColor Yellow
    "REACT_APP_API_URL=$backendUrl" | Out-File -FilePath ".env" -Encoding utf8
    
    # Ask for confirmation before deploying frontend
    $confirmFrontend = Read-Host "Deploy frontend to Vercel? (y/n)"
    if ($confirmFrontend -eq "y") {
        Write-Host "Running 'vercel --prod' for frontend..." -ForegroundColor Yellow
        vercel --prod
        
        Write-Host "`nDeployment completed!" -ForegroundColor Green
        Write-Host "Backend: $backendUrl" -ForegroundColor Cyan
        $frontendUrl = Read-Host "Enter the deployed frontend URL (e.g., https://qr-attendance-system.vercel.app)"
        Write-Host "Frontend: $frontendUrl" -ForegroundColor Cyan
        
        Write-Host "`nRemember to set these environment variables in the Vercel dashboard:" -ForegroundColor Yellow
        Write-Host "Backend: MONGO_URI, JWT_SECRET, NODE_ENV" -ForegroundColor Yellow
        Write-Host "Frontend: REACT_APP_API_URL" -ForegroundColor Yellow
    }
    else {
        Write-Host "Frontend deployment skipped." -ForegroundColor Yellow
    }
}
else {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
}

# Return to the root directory
Set-Location -Path $PSScriptRoot