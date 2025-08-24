# Authentication System API Documentation

## Overview
This authentication system provides secure access to protected endpoints that reveal hidden information only to authenticated users. The system implements JWT-based authentication with enhanced cookie management and session tracking.

## Security Features
- **JWT Authentication**: Access and refresh tokens
- **Secure Cookies**: HttpOnly, SameSite, Secure flags
- **Session Tracking**: User activity monitoring
- **Rate Limiting**: Protection against abuse
- **Session Validation**: Automatic session expiry

## Authentication Flow

### 1. User Registration
```http
POST /api/v1/users/register
Content-Type: multipart/form-data

{
  "username": "johndoe",
  "email": "john@example.com", 
  "fullName": "John Doe",
  "password": "securePassword123",
  "avatar": [file],
  "coverImage": [file]
}
```

### 2. User Login
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "usernameOrEmail": "johndoe",
  "password": "securePassword123"
}
```

**Response includes:**
- JWT tokens (access & refresh)
- Secure cookies with session data
- User profile information

### 3. Token Refresh
```http
POST /api/v1/users/refresh-token
Cookie: refreshToken=your_refresh_token
```

## Protected Endpoints (Require Authentication)

### Basic User Operations

#### Get Current User
```http
GET /api/v1/users/current-user
Authorization: Bearer your_access_token
```

#### Change Password
```http
POST /api/v1/users/change-password
Authorization: Bearer your_access_token

{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

#### Update Account Details
```http
PUT /api/v1/users/update-account-details
Authorization: Bearer your_access_token

{
  "fullName": "Updated Name",
  "email": "updated@example.com"
}
```

### Hidden Information Endpoints

#### 1. Secret Key Access
```http
GET /api/v1/users/secret-key
Authorization: Bearer your_access_token
```

**Returns:**
- Application secret key
- User information
- Access timestamp

#### 2. Admin Panel Access
```http
GET /api/v1/users/admin-panel
Authorization: Bearer your_access_token
```

**Returns:**
- Server information (Node.js version, platform, uptime)
- Database statistics
- System configuration status
- Memory usage metrics

#### 3. Vault Access
```http
GET /api/v1/users/vault-access
Authorization: Bearer your_access_token
```

**Returns:**
- Simulated API keys (Stripe, SendGrid, AWS)
- Database credentials (redacted)
- Encryption keys
- Maximum security level data

#### 4. User Analytics
```http
GET /api/v1/users/analytics
Authorization: Bearer your_access_token
```

**Returns:**
- Personal user statistics
- Account age and activity metrics
- Security information
- Login patterns and device info

### File Upload Endpoints

#### Update Avatar
```http
PATCH /api/v1/users/update-avatar
Authorization: Bearer your_access_token
Content-Type: multipart/form-data

{
  "avatar": [file]
}
```

#### Update Cover Image
```http
PATCH /api/v1/users/update-cover-image
Authorization: Bearer your_access_token
Content-Type: multipart/form-data

{
  "coverImage": [file]
}
```

### Social Features

#### Get User Channel Profile
```http
GET /api/v1/users/c/:username
Authorization: Bearer your_access_token
```

#### Get Watch History
```http
GET /api/v1/users/watch-history
Authorization: Bearer your_access_token
```

### Session Management

#### Logout
```http
POST /api/v1/users/logout
Authorization: Bearer your_access_token
```

**Clears all cookies and invalidates session**

## Security Middleware

### Session Tracking
- Monitors user activity
- Logs access patterns
- Tracks IP addresses and user agents

### Rate Limiting
- Sensitive endpoints: 10 requests per 15 minutes
- Prevents brute force attacks
- Returns rate limit headers

### Session Validation
- Automatic session expiry (24 hours)
- Session integrity checks
- Invalid session detection

## Cookie Configuration

### Access Token Cookie
```javascript
{
  httpOnly: true,        // Prevents XSS
  secure: true,          // HTTPS only (production)
  sameSite: 'strict',    // CSRF protection
  maxAge: 86400000,      // 24 hours
  path: '/'              // Available site-wide
}
```

### Refresh Token Cookie
```javascript
{
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 864000000,     // 10 days
  path: '/'
}
```

### Session Data Cookie
```javascript
{
  httpOnly: false,       // Accessible to client JS
  secure: true,
  sameSite: 'strict',
  maxAge: 86400000,      // 24 hours
  path: '/'
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized request",
  "success": false
}
```

### 429 Rate Limited
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "success": false
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "success": false
}
```

## Environment Variables Required

```env
PORT=8000
URI_KEY=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
SECRET_KEY=your_application_secret_key
ENCRYPTION_KEY=your_encryption_key
HMAC_SECRET=your_hmac_secret
NODE_ENV=development
```

## Testing the System

1. **Register a new user** with the registration endpoint
2. **Login** to receive JWT tokens and cookies
3. **Access protected endpoints** using the Bearer token
4. **Try accessing without authentication** to verify protection
5. **Test rate limiting** by making multiple rapid requests
6. **Verify session expiry** after 24 hours

## Security Best Practices Implemented

- ✅ JWT token-based authentication
- ✅ Secure cookie configuration
- ✅ Rate limiting on sensitive endpoints
- ✅ Session tracking and validation
- ✅ Automatic token refresh mechanism
- ✅ Proper error handling
- ✅ Input validation
- ✅ Password hashing (bcrypt)
- ✅ CORS protection
- ✅ Environment variable security

This authentication system provides a robust foundation for protecting sensitive information while maintaining good user experience through automatic token management and secure session handling.