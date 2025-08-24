# Railway Deployment Fix Guide

## Current Issue
MongoDB connection error: `The uri parameter to openUri() must be a string, got "undefined"`

## Root Cause
Environment variables are not being loaded properly in Railway deployment.

## Solution Steps

### 1. Set Environment Variables in Railway Dashboard

Go to your Railway project dashboard and set these variables:

```bash
PORT=8000
URI_KEY=mongodb+srv://pundkardevashish:devap2006@cluster0.vqqajyb.mongodb.net/auth-discovery?retryWrites=true&w=majority
CORS=*
ACCESS_TOKEN_SECRET=devashish
REFRESH_TOKEN_SECRET=devap2006
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=dyowd7y4b
CLOUDINARY_API_KEY=269865758572846
CLOUDINARY_API_SECRET=iBEZwkxYjgMZqlCMfoWx0YILwZU
SECRET_KEY=super-secret-key-only-for-authenticated-users-2025
ENCRYPTION_KEY=aes256-encryption-key-for-sensitive-data-2024
HMAC_SECRET=hmac-secret-for-data-integrity-verification
NODE_ENV=production
```

### 2. Railway CLI Method (Alternative)

If you have Railway CLI installed:

```bash
railway login
railway link [your-project-id]

# Set variables one by one
railway variables set PORT=8000
railway variables set URI_KEY="mongodb+srv://pundkardevashish:devap2006@cluster0.vqqajyb.mongodb.net/auth-discovery?retryWrites=true&w=majority"
railway variables set ACCESS_TOKEN_SECRET="devashish"
railway variables set REFRESH_TOKEN_SECRET="devap2006"
railway variables set ACCESS_TOKEN_EXPIRY="1d"
railway variables set REFRESH_TOKEN_EXPIRY="10d"
railway variables set CLOUDINARY_CLOUD_NAME="dyowd7y4b"
railway variables set CLOUDINARY_API_KEY="269865758572846"
railway variables set CLOUDINARY_API_SECRET="iBEZwkxYjgMZqlCMfoWx0YILwZU"
railway variables set SECRET_KEY="super-secret-key-only-for-authenticated-users-2025"
railway variables set ENCRYPTION_KEY="aes256-encryption-key-for-sensitive-data-2024"
railway variables set HMAC_SECRET="hmac-secret-for-data-integrity-verification"
railway variables set NODE_ENV="production"
railway variables set CORS="*"
```

### 3. Verify Deployment

After setting the environment variables:

1. **Redeploy**: Railway should automatically redeploy when you change environment variables
2. **Check Logs**: Look for the debug output we added:
   ```
   🔧 Dotenv Debug:
   🔍 Environment Debug:
   ✅ MongoDB Connected: [host]
   ```
3. **Test Health Endpoint**: Visit `https://your-app.railway.app/api/v1/users/health`

### 4. MongoDB Atlas Configuration

Ensure your MongoDB Atlas cluster allows Railway's IP addresses:

1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs)
3. Or add Railway's specific IP ranges if you prefer more security

### 5. Common Issues & Solutions

**Issue**: Still getting undefined error
**Solution**: Double-check variable names match exactly (case-sensitive)

**Issue**: Connection timeout
**Solution**: Check MongoDB Atlas network access settings

**Issue**: Authentication failed
**Solution**: Verify MongoDB connection string credentials

### 6. Security Notes

- Never commit `.env` files to git (already in `.gitignore`)
- Use Railway's environment variables for production
- Consider using Railway's built-in secrets management for sensitive data
- Rotate your MongoDB credentials if they were exposed

### 7. Debugging Commands

If issues persist, check Railway logs:

```bash
railway logs
```

Or connect to your deployment:

```bash
railway shell
```

## Files Modified

- `src/db/index.js` - Added debugging and better error handling
- `src/index.js` - Added dotenv debugging
- `src/routes/user.routes.js` - Added health check endpoint
- `railway.json` - Added Railway configuration