Deployment Steps

-Go to Railway Dashboard
-Click + New Project → Deploy from GitHub Repo
-Choose your backend repository

-Set Environment Variables
Add all necessary environment variables in the Variables section:

PORT=8080
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key

Set Build & Start Command (if not auto-detected)
-Build Command: npm install
-Start Command: npm start or node index.js

Deploy
-Railway auto-deploys on every push
-Get the hosted API URL from the Deployment tab, something like: -https://your-backend.up.railway.app

Update Frontend Environment
-Set the correct API URL in your Vercel environment:

NEXT_PUBLIC_SERVER_URI=railway-auto-created-url
