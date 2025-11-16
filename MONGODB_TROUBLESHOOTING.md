# 🚨 MongoDB Atlas Connection Troubleshooting Guide

## Current Issue: DNS Resolution Failure

**Error**: `querySrv ENOTFOUND _mongodb._tcp.cluster0.mongodb.net`

This error means the DNS system cannot find your MongoDB Atlas cluster. Here's how to fix it:

## ✅ **Step 1: Verify Your MongoDB Atlas Cluster**

1. **Log into MongoDB Atlas**: https://cloud.mongodb.com
2. **Check if your cluster exists and is running**:
   - Go to "Database" in the left sidebar
   - Look for your cluster - it should show "Running" status
   - **IMPORTANT**: Note the exact cluster name (it might NOT be "cluster0")

3. **Get the correct connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" driver
   - **Copy the exact connection string provided**

## ✅ **Step 2: Common Cluster Name Issues**

Your cluster name might be different from "cluster0". Common names:
- `cluster0.mongodb.net` (what we're using)
- `cluster0.abc123.mongodb.net` (with random suffix)
- `your-project-name.mongodb.net`
- `sandbox.mongodb.net` (free tier clusters)

## ✅ **Step 3: Update Connection String**

If your cluster has a different name, update these files:

1. **backend/.env** (local development):
```bash
MONGO_URI=mongodb+srv://shahkrishil1108:Pops%23100@YOUR-ACTUAL-CLUSTER-NAME.mongodb.net/quotebill-pro?retryWrites=true&w=majority
```

2. **Render Dashboard Environment Variables**:
   - Go to https://dashboard.render.com
   - Select your backend service
   - Update the MONGO_URI variable

## ✅ **Step 4: Verify Network Access**

In MongoDB Atlas:
1. Go to "Network Access" in the left sidebar
2. Ensure you have an IP whitelist entry for `0.0.0.0/0` (allow from anywhere)
3. Make sure the entry is active (green status)

## ✅ **Step 5: Verify Database User**

In MongoDB Atlas:
1. Go to "Database Access" in the left sidebar
2. Verify user `shahkrishil1108` exists
3. Ensure it has "Read and write to any database" permissions
4. Check the password is correct: `Pops#100`

## 🔧 **Step 6: Test Connection**

After making changes, test locally:

```bash
cd backend
node test-connection.js
```

## 📝 **What to Look For in MongoDB Atlas**

When you log into Atlas, find:

1. **Exact cluster name** (e.g., cluster0.abc123.mongodb.net)
2. **Connection string format** from Atlas dashboard
3. **Cluster status** (should be "Running")
4. **Network access** settings
5. **Database user** credentials

## 🎯 **Next Steps**

1. **Check your MongoDB Atlas dashboard** for the exact cluster details
2. **Update the connection string** with the correct cluster name
3. **Test the connection** locally first
4. **Update Render environment variables** with the correct string
5. **Redeploy** if needed

---

**Need Help?** 
- Check if your cluster is paused (Atlas pauses free clusters after inactivity)
- Verify your MongoDB Atlas account has an active cluster
- Try creating a new cluster if the current one is corrupted