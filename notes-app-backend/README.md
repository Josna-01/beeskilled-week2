# Assignment 3 – Notes App Backend (Mini Project)

A complete, production-grade **Notes App Backend API** built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**, featuring **JWT Authentication** and **strict multi-tenant authorization**.

---

## 1. Project Description and Objectives

The objective of this mini-project is to build a secure, multi-tenant notes-taking backend service where users can register, log in, and manage their personal notes with guaranteed privacy and isolation.

### Key Features
- **User Authentication**: Secure registration and login issuing signed JSON Web Tokens (JWT). Passwords hashed using `bcryptjs`.
- **Note Management CRUD**:
  - `POST /api/notes` – Create note linked to the authenticated user.
  - `GET /api/notes` – Retrieve all notes belonging strictly to the logged-in user.
  - `GET /api/notes/:id` – Retrieve a specific note by ID (owner only).
  - `PUT /api/notes/:id` – Update a specific note (owner only).
  - `DELETE /api/notes/:id` – Delete a specific note (owner only).
- **Strict Authorization & Data Isolation**:
  - All `/api/notes` routes are protected by the JWT authentication middleware.
  - Users are **forbidden (HTTP 403)** from viewing, modifying, or deleting notes belonging to other users.
  - Querying all notes (`GET /api/notes`) automatically scopes results to `user: req.user._id`.
- **Input Validation & Error Handling**:
  - Rejects empty titles or contents.
  - Validates MongoDB ObjectId format before querying.
  - Centralized error handler for clean, consistent error responses.

---

## 2. Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated backend web framework.
- **MongoDB**: NoSQL document database.
- **Mongoose**: ODM with schema models, data types, and index optimizations.
- **bcryptjs**: Password hashing and salt generation.
- **jsonwebtoken (JWT)**: Cryptographic Bearer token management.
- **dotenv**: Environment variable isolation.
- **cors**: Cross-Origin Resource Sharing.
- **Postman**: API testing and verification.

---

## 3. Project Structure

```text
notes-app-backend/
├── postman/
│   └── Notes_App_API.postman_collection.json
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile
│   │   └── noteController.js     # Notes CRUD with strict ownership verification
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token protection middleware
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── Note.js               # Note schema with reference to User
│   │   └── User.js               # User schema with bcrypt pre-save hook
│   ├── routes/
│   │   ├── authRoutes.js         # Public and protected auth routes
│   │   └── noteRoutes.js         # Protected notes CRUD routes
│   ├── app.js                    # Express application configuration
│   └── server.js                 # Server listener
├── tests/
│   └── notes.test.js             # End-to-end integration and security test suite
├── .env.example                  # Template configuration
├── .gitignore                    # Ignored files
├── package.json                  # Manifest & scripts
└── README.md                     # Documentation
```

---

## 4. Environment Variables Configuration

Create a `.env` file in the root of `notes-app-backend/` based on `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables Table

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5003` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/notes_app_db` |
| `JWT_SECRET` | Secret key for signing and verifying tokens | `<strong_random_secret_key>` |
| `JWT_EXPIRES_IN` | Token duration | `7d` |

> **MongoDB Setup**:
> - For **local MongoDB**, use: `mongodb://127.0.0.1:27017/notes_app_db`
> - For **MongoDB Atlas**, use your cloud cluster URI:
>   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/notes_app_db?retryWrites=true&w=majority`

---

## 5. Installation and Running the Server

### Step 1: Navigate to Project Directory
```bash
cd notes-app-backend
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
[MongoDB] Connected successfully: 127.0.0.1:27017/notes_app_db
[Server] Notes App Backend running in development mode on port 5003
```

---

## 6. API Endpoints Specification

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Access | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register user & issue JWT | `201`, `400` |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT | `200`, `400`, `401` |
| `GET` | `/api/auth/profile` | Protected | Get authenticated user profile | `200`, `401` |

### Notes Routes (`/api/notes`) – *All Require Bearer Token*

| Method | Endpoint | Access | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/notes` | Protected | Create a new note | `201`, `400`, `401` |
| `GET` | `/api/notes` | Protected | Get all notes for the logged-in user | `200`, `401` |
| `GET` | `/api/notes/:id` | Protected | Get single note by ID (owner only) | `200`, `400`, `401`, `403`, `404` |
| `PUT` | `/api/notes/:id` | Protected | Update a note (owner only) | `200`, `400`, `401`, `403`, `404` |
| `DELETE` | `/api/notes/:id` | Protected | Delete a note (owner only) | `200`, `400`, `401`, `403`, `404` |

---

## 7. Expected Request and Response Examples

### 1. User Registration (POST `/api/auth/register`)
**Request Body:**
```json
{
  "name": "Alice Cooper",
  "email": "alice@example.com",
  "password": "Password123"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "672e42bc56fe1c028a38b1f0",
      "name": "Alice Cooper",
      "email": "alice@example.com",
      "createdAt": "2026-11-08T18:30:00.000Z",
      "updatedAt": "2026-11-08T18:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Create Note (POST `/api/notes`)
**Request Header:** `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "title": "Database Architecture",
  "content": "Ensure schema models use proper indexes and relational references."
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "_id": "672e42bc56fe1c028a38b1f5",
    "title": "Database Architecture",
    "content": "Ensure schema models use proper indexes and relational references.",
    "user": "672e42bc56fe1c028a38b1f0",
    "createdAt": "2026-11-08T18:32:00.000Z",
    "updatedAt": "2026-11-08T18:32:00.000Z",
    "__v": 0
  }
}
```

### 3. Retrieve All Notes for Logged-In User (GET `/api/notes`)
**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "672e42bc56fe1c028a38b1f5",
      "title": "Database Architecture",
      "content": "Ensure schema models use proper indexes and relational references.",
      "user": "672e42bc56fe1c028a38b1f0",
      "createdAt": "2026-11-08T18:32:00.000Z",
      "updatedAt": "2026-11-08T18:32:00.000Z"
    }
  ]
}
```

### 4. Cross-User Unauthorized Access Attempt (GET `/api/notes/:id` by another user)
**Request Header:** `Authorization: Bearer <different_user_token>`
**Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Forbidden. You do not have permission to view this note."
}
```

### 5. Update Note (PUT `/api/notes/:id`)
**Request Body:**
```json
{
  "title": "Database Architecture - COMPLETED",
  "content": "All models, indexes, and relations are completed and tested."
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "_id": "672e42bc56fe1c028a38b1f5",
    "title": "Database Architecture - COMPLETED",
    "content": "All models, indexes, and relations are completed and tested.",
    "user": "672e42bc56fe1c028a38b1f0",
    "createdAt": "2026-11-08T18:32:00.000Z",
    "updatedAt": "2026-11-08T18:35:00.000Z"
  }
}
```

### 6. Delete Note (DELETE `/api/notes/:id`)
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Note deleted successfully",
  "data": {
    "id": "672e42bc56fe1c028a38b1f5"
  }
}
```

---

## 8. Postman Testing Instructions

1. Open **Postman**.
2. Click **Import** and select:
   `beeskilled-week2/notes-app-backend/postman/Notes_App_API.postman_collection.json`.
3. The collection is organized into logical folders:
   - `0. Health Check`
   - `1. Authentication`: Registers User A and User B, logs in User A, gets profile.
   - `2. Notes CRUD (User A)`: Creates notes, fetches all notes, fetches by ID, updates note.
   - `3. Authorization & Multi-Tenant Security`:
     - Verifies request without token gets `401 Unauthorized`.
     - Verifies User B trying to view User A's note gets `403 Forbidden`.
     - Verifies User B trying to update User A's note gets `403 Forbidden`.
     - Verifies User B trying to delete User A's note gets `403 Forbidden`.
     - Verifies User B fetching all notes sees empty list (`[]`).
   - `4. Delete & Verification`: Deletes note as owner and verifies `404 Not Found`.
4. Ensure the server is running on `http://localhost:5003`.
5. Execute requests in sequence or run the collection runner.

---

## 9. Automated Testing

To run the automated integration test suite:

```bash
npm test
```
Tests in-memory MongoDB setup, user registration, note creation, retrieval, updates, deletions, and all multi-tenant security barrier checks.

