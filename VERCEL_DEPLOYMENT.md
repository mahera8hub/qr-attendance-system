# Vercel Deployment Guide

This guide will help you deploy both the frontend and backend of the QR Attendance System to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Vercel CLI installed (optional, for command-line deployment)
   ```
   npm install -g vercel
   ```
3. A MongoDB Atlas account for the database

## Step 1: Deploy the Backend

1. Navigate to the backend directory:
   ```
   cd attendance-system/backend
   ```

2. Login to Vercel (if using CLI):
   ```
   vercel login
   ```

3. Deploy to Vercel:
   ```
   vercel --prod
   ```
   
   Alternatively, you can deploy directly from the Vercel dashboard:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Output Directory: Leave empty
     - Install Command: `npm install`

4. Set up environment variables in the Vercel dashboard:
   - MONGO_URI: Your MongoDB Atlas connection string
   - JWT_SECRET: A secure random string for JWT token generation
   - NODE_ENV: Set to "production"

5. Note the deployment URL (e.g., `https://qr-attendance-system-backend.vercel.app`)

## Step 2: Deploy the Frontend

1. Update the `.env` file in the frontend directory with your backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```

2. Navigate to the frontend directory:
   ```
   cd attendance-system/frontend
   ```

3. Deploy to Vercel:
   ```
   vercel --prod
   ```
   
   Alternatively, deploy from the Vercel dashboard:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`

4. Set up environment variables in the Vercel dashboard:
   - REACT_APP_API_URL: Your backend URL from Step 1

## Step 3: Connect to MongoDB Atlas

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient for starting)
3. Set up database access:
   - Create a database user with password authentication
   - Give the user read/write access to any database
4. Set up network access:
   - Add `0.0.0.0/0` to the IP whitelist to allow access from anywhere (for Vercel)
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string and replace `<password>` with your database user's password
6. Update the MONGO_URI environment variable in your Vercel backend project settings

## Step 4: Test Your Deployment

1. Visit your frontend URL (e.g., `https://qr-attendance-system.vercel.app`)
2. Test the registration and login functionality
3. Verify that the QR code generation and scanning works correctly

## Troubleshooting

### CORS Issues

If you encounter CORS errors:
1. Verify that the backend CORS configuration includes your frontend domain
2. Check that the frontend is using the correct backend URL

### Database Connection Issues

If the backend cannot connect to MongoDB:
1. Verify that the MONGO_URI environment variable is set correctly
2. Check that the database user has the correct permissions
3. Ensure that the IP whitelist includes `0.0.0.0/0` or the specific IPs of your Vercel deployment

### Deployment Failures

If deployment fails:
1. Check the build logs in the Vercel dashboard
2. Ensure all dependencies are correctly listed in package.json
3. Verify that the project structure matches the configuration in vercel.json

## Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository. Any changes pushed to your repository will trigger a new deployment.

To disable automatic deployments:
1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Git
3. Toggle off "Enable Git Integration"