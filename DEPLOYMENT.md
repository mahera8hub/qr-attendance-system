# Deployment Guide

## Backend Deployment (Node.js/Express)

### Option 1: Heroku

1. Create a Heroku account at [heroku.com](https://heroku.com)
2. Install the Heroku CLI: [Heroku CLI Installation Guide](https://devcenter.heroku.com/articles/heroku-cli)
3. Login to Heroku CLI:
   ```
   heroku login
   ```
4. Navigate to the backend directory:
   ```
   cd attendance-system/backend
   ```
5. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```
6. Add a Procfile in the backend directory with the following content:
   ```
   web: node server.js
   ```
7. Set up environment variables in Heroku:
   ```
   heroku config:set MONGO_URI=your_mongodb_atlas_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret_key
   heroku config:set NODE_ENV=production
   ```
8. Deploy to Heroku:
   ```
   git subtree push --prefix backend heroku master
   ```

### Option 2: Render

1. Create a Render account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add environment variables (MONGO_URI, JWT_SECRET, NODE_ENV)

## Frontend Deployment (React)

### Option 1: Netlify

1. Create a Netlify account at [netlify.com](https://netlify.com)
2. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```
3. Navigate to the frontend directory:
   ```
   cd attendance-system/frontend
   ```
4. Build the React app:
   ```
   npm run build
   ```
5. Deploy to Netlify:
   ```
   netlify deploy --prod
   ```

### Option 2: Vercel

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```
3. Navigate to the frontend directory:
   ```
   cd attendance-system/frontend
   ```
4. Deploy to Vercel:
   ```
   vercel --prod
   ```

## Database: MongoDB Atlas

1. Create a MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up database access (username and password)
4. Set up network access (IP whitelist)
5. Get your connection string and use it as the MONGO_URI environment variable in your backend deployment

## Connecting Frontend to Backend

After deploying both the frontend and backend, you need to update the API base URL in the frontend to point to your deployed backend:

1. Create a `.env` file in the frontend directory with the following content:
   ```
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```
2. Rebuild and redeploy the frontend

## Setting Up a Custom Domain (Optional)

### For Backend (Heroku)

```
heroku domains:add www.yourdomain.com
heroku domains:add yourdomain.com
```

### For Frontend (Netlify/Vercel)

Follow the domain configuration instructions in your hosting provider's dashboard.

## Continuous Deployment

Both Netlify and Vercel support automatic deployments when you push to your GitHub repository. You can configure this in their respective dashboards.

For Heroku, you can set up automatic deployments by connecting your GitHub repository in the Heroku dashboard.