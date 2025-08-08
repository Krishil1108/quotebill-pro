# MongoDB Atlas Connection Troubleshooting Guide

## Current Issue: Authentication Failed

The error "bad auth : Authentication failed" typically indicates one of the following issues:

### 1. **Check MongoDB Atlas Credentials**
- Username: `shahkrishil1108`
- Password: `Krishil@1108`
- Verify these credentials in your MongoDB Atlas dashboard

### 2. **IP Whitelist Configuration**
- Go to MongoDB Atlas Dashboard → Network Access
- Add your current IP address: `0.0.0.0/0` (allow all IPs) for testing
- Or find your specific IP and add it

### 3. **Database User Permissions**
- Go to MongoDB Atlas Dashboard → Database Access
- Ensure the user `shahkrishil1108` exists
- Verify it has "Read and write to any database" permissions
- Check if the user is set to a specific database

### 4. **Connection String Variations to Try**

Replace the MONGO_URI in your `.env` file with one of these:

**Option 1 - With specific database:**
```
MONGO_URI=mongodb+srv://shahkrishil1108:Krishil%401108@cluster0.wmqwufd.mongodb.net/quotebill?retryWrites=true&w=majority
```

**Option 2 - Without specific database:**
```
MONGO_URI=mongodb+srv://shahkrishil1108:Krishil%401108@cluster0.wmqwufd.mongodb.net/?retryWrites=true&w=majority
```

**Option 3 - With authSource:**
```
MONGO_URI=mongodb+srv://shahkrishil1108:Krishil%401108@cluster0.wmqwufd.mongodb.net/quotebill?retryWrites=true&w=majority&authSource=admin
```

### 5. **Password Encoding Issues**
If your password contains special characters, try these encodings:
- `@` becomes `%40`
- `!` becomes `%21`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `^` becomes `%5E`
- `&` becomes `%26`

### 6. **Alternative: Use Local MongoDB**
If Atlas continues to fail, install MongoDB locally:

**Windows:**
1. Download MongoDB Community Server
2. Install with default settings
3. The app will automatically fallback to `mongodb://localhost:27017/quotebill`

### 7. **Testing Steps**
1. Try each connection string option above
2. Check Atlas dashboard for connection logs
3. Verify your internet connection
4. Try connecting from MongoDB Compass with the same credentials

### 8. **Quick Fix**
For immediate testing, update your `.env` to use local MongoDB:
```
MONGO_URI=mongodb://localhost:27017/quotebill
```

Then install MongoDB locally or use MongoDB Atlas with corrected credentials.
