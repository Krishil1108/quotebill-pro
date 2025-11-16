# 🚀 Backend Render Deployment Guide - QuoteBill Pro

Complete step-by-step guide to deploy the QuoteBill Pro backend on Render.

## 🚨 Quick Fix for Current Issue

**If you're seeing npm error with "backend/backend/package.json":**

Use these **exact** commands in Render:
```bash
# Build Command:
npm install

# Start Command:
node server.js
```

**If Node.js version warning appears:** The `.nvmrc` has been updated to Node.js 20.11.0 (LTS).

## 📋 Prerequisites

- ✅ GitHub repository: `https://github.com/Krishil1108/quotebill-pro`
- ✅ MongoDB Atlas cluster with credentials: `shahkrishil1128:Krishil@1129`
- ✅ Render account: [https://dashboard.render.com](https://dashboard.render.com)

## 🔧 Step 1: Render Service Configuration

### **1.1 Create New Web Service**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Krishil1108/quotebill-pro`

### **1.2 Basic Configuration**
```yaml
Name: quotebill-pro
Environment: Node
Region: Oregon (US West) # or closest to your users
Branch: main
Root Directory: backend  # IMPORTANT: Set this to 'backend'
```

### **1.3 Build & Start Commands**
```bash
# Build Command
npm install

# Start Command  
node server.js
```

**Alternative Commands (if above doesn't work):**
```bash
# Build Command
npm ci --only=production

# Start Command
npm start
```

## 🌍 Step 2: Environment Variables

Add these **exact** environment variables in Render Dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGO_URI` | `mongodb+srv://shahkrishil1128:Krishil%401129@cluster0.d1rfw.mongodb.net/quotebill?retryWrites=true&w=majority` |

⚠️ **Critical**: Use `%40` for `@` and `%401129` for `@1129` in the password

## 🗄️ Step 3: MongoDB Atlas Configuration

### **3.1 Network Access**
1. Go to MongoDB Atlas → **"Network Access"**
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
3. Confirm entry shows **"Active"** status

### **3.2 Database User**
1. Go to **"Database Access"**
2. Verify user `shahkrishil1128` exists
3. Ensure it has **"Read and write to any database"** privileges
4. Password should be: `Krishil@1129`

### **3.3 Database Name**
- Database: `quotebill`
- Collections will be auto-created: `documents`, `settings`, `materials`, etc.

## 🔍 Step 4: Deployment Process

### **4.1 Deploy**
1. Click **"Create Web Service"**
2. Wait for build process (2-4 minutes)
3. Monitor build logs for errors

### **4.2 Expected Build Output**
```bash
==> Cloning from https://github.com/Krishil1108/quotebill-pro...
==> Using Node.js version 20.11.0 via /opt/render/project/src/.nvmrc
==> Running build command 'npm install'
npm WARN deprecated [package warnings...]
added XXX packages in XXs
==> Build completed successfully ✅
==> Running start command 'node server.js'
==> 🔗 Environment check:
==> NODE_ENV: production
==> PORT: 10000  
==> MONGO_URI provided: true
==> ✅ Connected to MongoDB Atlas successfully!
==> 📊 Database connection established and ready for operations
==> 🚀 Server running on port 10000
```

## ✅ Step 5: Verify Deployment

### **5.1 Health Check**
Your service will be available at: `https://quotebill-pro.onrender.com`

Test endpoints:
```bash
# Health check
GET https://quotebill-pro.onrender.com/api/health
Expected: {"status":"OK","mongodb":"connected"}

# Documents API
GET https://quotebill-pro.onrender.com/api/documents  
Expected: {"documents":[],"totalPages":0,...}

# Settings API
GET https://quotebill-pro.onrender.com/api/settings
Expected: {"letterhead":{...},"particulars":[...],...}
```

### **5.2 CORS Configuration**
The backend is configured to allow requests from:
- `https://quotebill-pro-frontend.onrender.com` (your frontend)
- `http://localhost:3000` (local development)

## 🔧 Step 6: Frontend Integration

Update your frontend's API base URL:
```javascript
// In frontend/quote-bill-app/src/App.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://quotebill-pro.onrender.com/api';
```

Set environment variable in frontend Render service:
```
REACT_APP_API_BASE_URL=https://quotebill-pro.onrender.com/api
```

## 🚨 Troubleshooting

### **Common Issues & Solutions**

#### **Issue: 500 Internal Server Error**
```bash
# Check MongoDB connection
curl https://quotebill-pro.onrender.com/api/health

# If mongodb: "disconnected":
1. Verify MONGO_URI environment variable
2. Check MongoDB Atlas IP whitelist
3. Confirm database credentials
```

#### **Issue: npm ENOENT Error - "backend/backend/package.json"**
```bash
# Error: npm ERR! path /opt/render/project/src/backend/backend/package.json
# Cause: Render is looking in wrong nested directory

# Solution: Use simple commands without prefixes
Build Command: npm install
Start Command: node server.js

# Why: Render automatically sets working directory to backend/
# No need for --prefix or cd commands
```

#### **Issue: Build Fails - "cd: backend: No such file or directory"**
```bash
# Error: bash: line 1: cd: backend: No such directory
# Cause: Render can't find the backend directory

# Solution: Use simple commands
Build Command: npm install
Start Command: node server.js
```

#### **Issue: Node.js Version Warning**
```bash
# Warning: Node.js version 18.19.0 has reached end-of-life
# Solution: Update .nvmrc file in root directory
echo "20.11.0" > .nvmrc

# Or use latest LTS version:
echo "lts/*" > .nvmrc
```

#### **Issue: General Build Fails**
```bash
# Common causes:
1. Missing package.json in backend/
2. Node.js version compatibility  
3. Missing environment variables
4. Incorrect build/start commands

# Solution: Check build logs in Render dashboard
```

#### **Issue: CORS Errors**
```bash
# Add your frontend domain to server.js:
const corsOptions = {
  origin: [
    'https://your-frontend-domain.onrender.com',
    'http://localhost:3000'
  ]
};
```

## 📊 Monitoring & Maintenance

### **Logs Access**
- Render Dashboard → Your Service → **"Logs"** tab
- Real-time log streaming available
- Search and filter capabilities

### **Metrics**
- CPU usage, memory consumption
- Request count and response times  
- Database connection status

### **Auto-Deploy**
- Automatic deployment on GitHub push to `main` branch
- Manual deploy option available in dashboard
- Rollback to previous versions supported

## 🔄 Updates & Redeployment

### **Code Updates**
1. Push changes to GitHub `main` branch
2. Render auto-deploys (2-4 minutes)
3. Monitor deployment in dashboard

### **Environment Variable Updates**
1. Go to Render Dashboard → Service → **"Environment"**
2. Update variables
3. Save changes (triggers automatic redeploy)

### **MongoDB Schema Updates**
- Database migrations handled automatically by Mongoose
- New collections created on first use
- No manual intervention required

## 📋 Production Checklist

- [ ] ✅ Service deployed successfully
- [ ] ✅ Health endpoint returns `mongodb: "connected"`
- [ ] ✅ All API endpoints respond correctly
- [ ] ✅ Frontend can communicate with backend
- [ ] ✅ MongoDB Atlas IP whitelist configured
- [ ] ✅ Environment variables set correctly
- [ ] ✅ Auto-deploy from GitHub working
- [ ] ✅ Logs showing no errors

## 🔗 Useful Links

- **Render Dashboard**: [https://dashboard.render.com](https://dashboard.render.com)
- **MongoDB Atlas**: [https://cloud.mongodb.com](https://cloud.mongodb.com)
- **GitHub Repository**: [https://github.com/Krishil1108/quotebill-pro](https://github.com/Krishil1108/quotebill-pro)
- **Backend Service**: `https://quotebill-pro.onrender.com`

---

💡 **Pro Tip**: Bookmark your service URL and keep the MongoDB Atlas dashboard handy for quick troubleshooting. The health endpoint is your best friend for diagnosing connection issues!