# Week 2 – Backend Development Assignments

This repository contains the complete implementation of the **Week 2 Backend Development Assignments** for the **MERN Stack Development** course.

Each project is completely independent with its own `package.json`, environment variables, source code, test suites, and Postman collections.

---

## 📁 Repository Structure

```text
beeskilled-week2/
│
├── todo-rest-api/                   # Assignment 1: To-Do List REST API
│   ├── postman/
│   │   └── Todo_API.postman_collection.json
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/taskController.js
│   │   ├── middleware/errorHandler.js
│   │   ├── models/Task.js
│   │   ├── routes/taskRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/task.test.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── user-authentication-api/         # Assignment 2: User Authentication API
│   ├── postman/
│   │   └── User_Auth_API.postman_collection.json
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/authController.js
│   │   ├── middleware/authMiddleware.js
│   │   ├── middleware/errorHandler.js
│   │   ├── models/User.js
│   │   ├── routes/authRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/auth.test.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── notes-app-backend/               # Assignment 3: Notes App Backend (Mini Project)
│   ├── postman/
│   │   └── Notes_App_API.postman_collection.json
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/authController.js
│   │   ├── controllers/noteController.js
│   │   ├── middleware/authMiddleware.js
│   │   ├── middleware/errorHandler.js
│   │   ├── models/Note.js
│   │   ├── models/User.js
│   │   ├── routes/authRoutes.js
│   │   ├── routes/noteRoutes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/notes.test.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md                        # Master Documentation
```

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Node.js** (v18+) | Runtime environment |
| **Express.js** | RESTful web server framework |
| **MongoDB** | NoSQL document database |
| **Mongoose** (v8+) | Object Data Modeling (ODM) for MongoDB |
| **bcryptjs** | Salt-based password hashing |
| **jsonwebtoken (JWT)** | Stateless authentication tokens |
| **dotenv** | Environment configuration management |
| **cors** | Cross-Origin Resource Sharing |
| **Postman** | API testing and endpoint documentation |

---

## 📋 Assignments Overview

### Assignment 1: To-Do List REST API (`todo-rest-api/`)
A RESTful API for managing tasks with full CRUD operations and validation.
- **Port**: `5001`
- **Database**: `todo_db`
- **Endpoints**:
  - `POST /api/tasks` – Create a new task (validates title and status).
  - `GET /api/tasks` – Retrieve all tasks (supports query filtering `?status=pending|completed`).
  - `GET /api/tasks/:id` – Retrieve a single task by ID.
  - `PUT /api/tasks/:id` – Update an existing task.
  - `DELETE /api/tasks/:id` – Delete a task.
- **Features**: Input validation, centralized error handler, Mongoose schema with `timestamps`.

### Assignment 2: User Authentication API (`user-authentication-api/`)
A secure registration and authentication system using JWT and salted bcrypt password hashing.
- **Port**: `5002`
- **Database**: `user_auth_db`
- **Endpoints**:
  - `POST /api/auth/register` – Register a new user, hashes password, returns JWT.
  - `POST /api/auth/login` – Authenticates credentials, returns JWT.
  - `GET /api/auth/profile` – Protected endpoint; returns profile of authenticated user.
- **Features**: Mongoose pre-save password hash hook, duplicate email prevention (400), sanitized user JSON (password excluded), Bearer token verification middleware.

### Assignment 3: Notes App Backend Mini Project (`notes-app-backend/`)
A multi-tenant notes application backend with user authentication and strict data isolation.
- **Port**: `5003`
- **Database**: `notes_app_db`
- **Endpoints**:
  - `POST /api/auth/register` – User registration.
  - `POST /api/auth/login` – User login.
  - `GET /api/auth/profile` – Protected user profile.
  - `POST /api/notes` – Create note associated with authenticated user.
  - `GET /api/notes` – Retrieve all notes belonging to the logged-in user.
  - `GET /api/notes/:id` – Retrieve a note by ID (owner only).
  - `PUT /api/notes/:id` – Update a note by ID (owner only).
  - `DELETE /api/notes/:id` – Delete a note by ID (owner only).
- **Security & Authorization**: Users are strictly forbidden (**HTTP 403**) from accessing, modifying, or deleting notes belonging to other users.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x or newer) installed.
- **MongoDB** running locally on port `27017` OR a **MongoDB Atlas** cloud connection string.

### 2. Running Assignment 1 (To-Do REST API)
```bash
cd todo-rest-api
copy .env.example .env     # (On Linux/macOS: cp .env.example .env)
npm install
npm run dev               # Or: npm start
```

### 3. Running Assignment 2 (User Authentication API)
```bash
cd user-authentication-api
copy .env.example .env
npm install
npm run dev
```

### 4. Running Assignment 3 (Notes App Backend)
```bash
cd notes-app-backend
copy .env.example .env
npm install
npm run dev
```

---

## ⚙️ Environment Variables Summary

Each project directory includes a `.env.example` file. Create `.env` files with the following keys:

### Assignment 1: `todo-rest-api/.env`
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/todo_db
NODE_ENV=development
```

### Assignment 2: `user-authentication-api/.env`
```env
PORT=5002
MONGODB_URI=mongodb://127.0.0.1:27017/user_auth_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Assignment 3: `notes-app-backend/.env`
```env
PORT=5003
MONGODB_URI=mongodb://127.0.0.1:27017/notes_app_db
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> **Note on MongoDB Atlas**:
> To connect via MongoDB Atlas, replace `MONGODB_URI` with:
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority`

---

## 📬 Postman Collections & Testing

Every assignment comes with an exported **Postman Collection (v2.1)** located inside each project's `postman/` directory:

1. **Assignment 1**: `todo-rest-api/postman/Todo_API.postman_collection.json` (11 requests covering all CRUD actions, filtering, and error validation).
2. **Assignment 2**: `user-authentication-api/postman/User_Auth_API.postman_collection.json` (10 requests covering registration, login, token auto-saving, duplicate email errors, and protected profile access).
3. **Assignment 3**: `notes-app-backend/postman/Notes_App_API.postman_collection.json` (14 requests covering dual-user registration, notes CRUD, and multi-tenant security verification tests with HTTP 403 checks).

### How to Import and Test in Postman:
1. Open **Postman**.
2. Click **Import** (top left).
3. Select the respective `.postman_collection.json` file.
4. Set the collection variable `baseUrl` if different from default (`http://localhost:5001`, `http://localhost:5002`, or `http://localhost:5003`).
5. Execute requests sequentially or use the **Collection Runner**.

---

## 🧪 Automated Integration Tests

Each project includes an automated end-to-end integration test runner powered by `mongodb-memory-server` and `supertest`. These tests boot an in-memory MongoDB instance and verify all database queries, validation rules, token generations, and security boundaries.

Run tests in each project:
```bash
# Assignment 1: To-Do REST API
cd todo-rest-api && npm test

# Assignment 2: User Authentication API
cd ../user-authentication-api && npm test

# Assignment 3: Notes App Backend
cd ../notes-app-backend && npm test
```

