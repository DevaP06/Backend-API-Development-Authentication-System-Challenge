# 🚀 Deployment Guide - Authentication Discovery System

## 📋 Pre-Deployment Checklist

- [x] Production scripts added to package.json
- [x] Environment variables configured
- [x] .gitignore includes sensitive files
- [x] MongoDB connection string ready
- [x] Code tested locally

## 🌐 Deployment Options

### 1. 🎯 **Render (Recommended - Free)**

#### **Step 1: Prepare Repository**
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### **Step 2: Deploy on Render**
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   ```
   Name: auth-discovery-api
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

#### **Step 3: Environment Variables**
Add these in Render dashboard:
```
PORT=8000
URI_KEY=mongodb+srv://username:password@cluster.mongodb.net/dbname
ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-2024
REFRESH_TOKEN_SECRET=your-refresh-secret-key-2024
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
SECRET_KEY=your-application-secret-key-2024
ENCRYPTION_KEY=your-encryption-key-2024
HMAC_SECRET=your-hmac-secret-2024
NODE_ENV=production
CORS=*
```

#### **Step 4: Deploy**
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Get your live URL: `https://your-app-name.onrender.com`

---

### 2. 🚂 **Railway**

#### **Step 1: Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

#### **Step 2: Deploy**
```bash
railway new
railway add
railway up
```

#### **Step 3: Set Environment Variables**
```bash
railway variables set PORT=8000
railway variables set URI_KEY="your-mongodb-connection"
railway variables set ACCESS_TOKEN_SECRET="your-jwt-secret"
# ... add all other variables
```

---

### 3. ▲ **Vercel**

#### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
vercel login
```

#### **Step 2: Create vercel.json**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ]
}
```

#### **Step 3: Deploy**
```bash
vercel
```

---

### 4. 🟣 **Heroku**

#### **Step 1: Install Heroku CLI**
Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

#### **Step 2: Create Heroku App**
```bash
heroku login
heroku create your-app-name
```

#### **Step 3: Set Environment Variables**
```bash
heroku config:set PORT=8000
heroku config:set URI_KEY="your-mongodb-connection"
heroku config:set ACCESS_TOKEN_SECRET="your-jwt-secret"
# ... add all variables
```

#### **Step 4: Deploy**
```bash
git push heroku main
```

---

## 🗄️ Database Setup (MongoDB Atlas)

### **Step 1: Create MongoDB Atlas Account**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create new cluster (free tier)

### **Step 2: Configure Database**
1. Create database user
2. Whitelist IP addresses (0.0.0.0/0 for all)
3. Get connection string
4. Replace in URI_KEY environment variable

### **Example Connection String:**
```
mongodb+srv://username:password@cluster0.mongodb.net/auth-discovery?retryWrites=true&w=majority
```

---

## 🔒 Security for Production

### **Environment Variables (Critical)**
```bash
# Generate strong secrets
ACCESS_TOKEN_SECRET=$(openssl rand -base64 64)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 64)
SECRET_KEY=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
HMAC_SECRET=$(openssl rand -base64 32)
```

### **CORS Configuration**
Update for production:
```javascript
// In src/app.js
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'https://your-app.onrender.com'],
  credentials: true
}));
```

---

## 🧪 Testing Deployed API

### **Base URL Examples:**
- Render: `https://your-app.onrender.com`
- Railway: `https://your-app.up.railway.app`
- Vercel: `https://your-app.vercel.app`
- Heroku: `https://your-app.herokuapp.com`

### **Test Endpoints:**
```bash
# Health check
curl https://your-deployed-url.com/api/v1/users/current-user

# Register user
curl -X POST https://your-deployed-url.com/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","fullName":"Test User","password":"password123"}'

# Login
curl -X POST https://your-deployed-url.com/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"testuser","password":"password123"}'
```

---

## 📊 Monitoring & Logs

### **Render:**
- View logs in dashboard
- Monitor performance metrics
- Set up alerts

### **Railway:**
```bash
railway logs
railway status
```

### **Vercel:**
```bash
vercel logs
```

### **Heroku:**
```bash
heroku logs --tail
```

---

## 🚨 Troubleshooting

### **Common Issues:**

#### **Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check build logs for specific errors

#### **Environment Variables:**
- Ensure all required variables are set
- Check for typos in variable names
- Verify MongoDB connection string format

#### **CORS Errors:**
- Update CORS origin in production
- Check frontend domain configuration

#### **Database Connection:**
- Verify MongoDB Atlas IP whitelist
- Check database user permissions
- Test connection string locally first

---

## 🎯 Quick Deploy (Render - Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to render.com
   - New Web Service
   - Connect GitHub repo
   - Add environment variables
   - Deploy!

3. **Test Discovery System:**
   - Use your new URL in Postman
   - Follow the 3-step discovery process
   - Verify all endpoints work

Your authentication discovery system will be live and accessible worldwide! 🌍