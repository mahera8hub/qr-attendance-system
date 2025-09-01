# Manual Vercel Deployment Guide

Since we encountered issues with the Vercel CLI, this guide will walk you through deploying the QR Attendance System manually using the Vercel web interface.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A GitHub account with your project repository pushed to it
3. A MongoDB Atlas account for the database

## Step 1: Set Up MongoDB Atlas

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
   - Use this connection string: `mongodb+srv://dbmuser:<db_password>@cluster0.dyzsjxh.mongodb.net/attendance-system?retryWrites=true&w=majority&appName=Cluster0`
   - Replace `<db_password>` with your database user's password

## Step 2: Deploy the Backend to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - Root Directory: `backend`
   - Framework Preset: Other
   - Build Command: `npm install`
   - Output Directory: Leave empty
   - Install Command: `npm install`
5. Click "Environment Variables" and add:
   - `MONGO_URI`: `mongodb+srv://dbmuser:<db_password>@cluster0.dyzsjxh.mongodb.net/attendance-system?retryWrites=true&w=majority&appName=Cluster0` (replace `<db_password>` with your actual password)
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `NODE_ENV`: Set to `production`
6. Click "Deploy"
7. Once deployed, note the URL (e.g., `https://qr-attendance-system-backend.vercel.app`)

## Step 3: Update Frontend Configuration

1. In your local project, update the frontend `.env` file with your backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```
2. Commit and push these changes to GitHub

## Step 4: Deploy the Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click "Add New..." → "Project"
3. Import your GitHub repository (same as before)
4. Configure the project:
   - Root Directory: `frontend`
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`
5. Click "Environment Variables" and add:
   - `REACT_APP_API_URL`: Your backend URL from Step 2
6. Click "Deploy"

## Step 5: Test Your Deployment

1. Visit your frontend URL (e.g., `https://qr-attendance-system.vercel.app`)
2. Test the registration and login functionality
3. Verify that the QR code generation and scanning works correctly

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Errors**:
   - Verify your MongoDB Atlas connection string is correct
   - Check that your IP whitelist includes `0.0.0.0/0`
   - Ensure your database user has the correct permissions

2. **CORS Errors**:
   - Verify that the frontend URL is correctly added to the CORS configuration in `server.js`

### Frontend Issues

1. **API Connection Errors**:
   - Check that the `REACT_APP_API_URL` environment variable is set correctly
   - Verify that the backend is running and accessible

2. **Build Errors**:
   - Check the build logs in the Vercel dashboard
   - Ensure all dependencies are correctly installed

## Maintaining Your Deployment

1. **Updating Your Application**:
   - Push changes to your GitHub repository
   - Vercel will automatically rebuild and deploy your application

2. **Monitoring**:
   - Use the Vercel dashboard to monitor your application's performance
   - Check the MongoDB Atlas dashboard for database metrics

3. **Scaling**:
   - Upgrade your MongoDB Atlas cluster if you need more resources
   - Vercel automatically scales your application based on traffic