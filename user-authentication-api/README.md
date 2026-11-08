# Assignment 2 – User Authentication API

A secure, modular **User Authentication REST API** built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**, featuring **bcryptjs** password hashing and **JSON Web Token (JWT)** session-less authentication.

---

## 1. Project Description and Objectives

The objective of this assignment is to implement an enterprise-standard user registration and authentication service following secure coding principles:

### Key Features
- **Secure Password Storage**: Plain-text passwords are never stored. Passwords are automatically hashed with `bcryptjs` using 10 salt rounds inside a Mongoose pre-save hook.
- **JWT Authentication**: Upon successful registration or login, a cryptographically signed JSON Web Token is issued containing the user ID payload.
- **Token Verification Middleware**: An Express middleware verifies the Bearer JWT token in the `Authorization` header and populates `req.user`.
- **Protected Profile Route**: Endpoint accessible only by users presenting a valid Bearer token.
- **Input Validation & Duplicate Prevention**: Validates email format, minimum password length, and gracefully catches duplicate email registrations (HTTP 400).
- **Environment Isolation**: Database URIs and JWT secret keys are loaded from environment variables (`.env`).

---

## 2. Technologies Used

- **Node.js**: Asynchronous event-driven JavaScript runtime.
- **Express.js**: Minimalist web application framework.
- **MongoDB**: Document-oriented database.
- **Mongoose**: ODM providing schema definitions, hooks, and validation.
- **bcryptjs**: Optimized pure JavaScript bcrypt library for password hashing.
- **jsonwebtoken (JWT)**: Standardized HMAC SHA-256 token generation and verification.
- **dotenv**: Secure configuration loader.
- **cors**: Cross-Origin resource sharing middleware.
- **Postman**: HTTP client for endpoint testing.

---

## 3. Project Structure

```text
user-authentication-api/
├── postman/
│   └── User_Auth_API.postman_collection.json
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   └── authController.js     # Register, login, getProfile handlers
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification middleware
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   └── User.js               # Mongoose schema with bcrypt pre-save hook
│   ├── routes/
│   │   └── authRoutes.js         # /api/auth routes declaration
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Server entry point
├── tests/
│   └── auth.test.js              # Integration test suite
├── .env.example                  # Environment variable template
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies & scripts
└── README.md                     # Documentation
```

---

## 4. Environment Variables Configuration

Create a `.env` file in the root of `user-authentication-api/` based on `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables Table

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | HTTP port on which the server listens | `5002` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/user_auth_db` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `<strong_random_secret_key>` |
| `JWT_EXPIRES_IN`| Token lifespan | `7d` |

> **Security Note**: Never commit your `.env` file or expose your `JWT_SECRET` publicly.

---

## 5. Installation and Running the Server

### Step 1: Navigate to Project Directory
```bash
cd user-authentication-api
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
```bash
copy .env.example .env   # On Windows
cp .env.example .env     # On Linux / macOS
```
*(Ensure `MONGODB_URI` and `JWT_SECRET` are set appropriately in `.env`)*

### Step 4: Start the Server
- **Development mode** (auto-restart with nodemon):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

Console output upon start:
```text
[MongoDB] Connected successfully: 127.0.0.1:27017/user_auth_db
[Server] User Authentication API running in development mode on port 5002
```

---

## 6. API Endpoints Specification

| Method | Endpoint | Access | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Health Check & API index | `200` |
| `POST` | `/api/auth/register` | Public | Register new user & issue token | `201`, `400` |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue token | `200`, `400`, `401` |
| `GET` | `/api/auth/profile` | Protected | Get profile of logged-in user | `200`, `401` |

---

## 7. Expected Request and Response Examples

### 1. User Registration (POST `/api/auth/register`)
**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "Password123!"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "672e42bc56fe1c028a38b1e1",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2026-11-08T18:25:00.000Z",
      "updatedAt": "2026-11-08T18:25:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Duplicate Email Registration (POST `/api/auth/register`)
**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

### 3. User Login (POST `/api/auth/login`)
**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "672e42bc56fe1c028a38b1e1",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2026-11-08T18:25:00.000Z",
      "updatedAt": "2026-11-08T18:25:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Invalid Credentials (POST `/api/auth/login`)
**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 5. Protected Profile Access (GET `/api/auth/profile`)
**Request Headers:**
```http
Authorization: Bearer <your_jwt_token_here>
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "672e42bc56fe1c028a38b1e1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "createdAt": "2026-11-08T18:25:00.000Z",
    "updatedAt": "2026-11-08T18:25:00.000Z"
  }
}
```

### 6. Protected Profile Unauthorized (No Token) (GET `/api/auth/profile`)
**Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Access denied. No authentication token provided."
}
```

---

## 8. Postman Testing Instructions

1. Open **Postman**.
2. Click **Import** and select:
   `beeskilled-week2/user-authentication-api/postman/User_Auth_API.postman_collection.json`.
3. The collection is configured with tests that automatically extract the JWT token from the registration/login responses and store it in `{{authToken}}`.
4. Requests provided:
   - `0. Health Check`
   - `1. Register User (Valid)` -> auto-sets `authToken`
   - `2. Register User (Duplicate Email - 400)`
   - `3. Register User (Validation Error - Short Password)`
   - `4. Login User (Valid Credentials)` -> auto-refreshes `authToken`
   - `5. Login User (Invalid Password - 401)`
   - `6. Login User (Non-existent Email - 401)`
   - `7. Get Profile (Protected - Valid JWT)`
   - `8. Get Profile (Missing Token - 401)`
   - `9. Get Profile (Invalid Token - 401)`
5. Run the requests individually or run the complete collection using the Collection Runner.

---

## 9. Automated Testing

To run the automated integration test suite:

```bash
npm test
```
This boots an in-memory MongoDB server, checks registration, password hashing verification, token generation, login credential checks, and protected profile access.

