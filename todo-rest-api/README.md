# Assignment 1 – To-Do List REST API

A clean, production-grade RESTful API for managing tasks, built with **Node.js**, **Express.js**, and **MongoDB** using **Mongoose ODM**. This project is developed as part of the Week 2 Backend Development course assignments.

---

## 1. Project Description and Objectives

The objective of this assignment is to develop an independent RESTful backend service that manages To-Do tasks with full CRUD (Create, Read, Update, Delete) capabilities.

### Key Features
- **RESTful Endpoints**: Full CRUD operations on tasks.
- **Data Persistence**: Powered by MongoDB with Mongoose Schema and validation.
- **Input Validation**: Rejects missing required fields, empty strings, and invalid status values.
- **Centralized Error Handling**: Unified error response format for validation errors, CastErrors (malformed ObjectIDs), and 404s.
- **Filtering & Sorting**: Ability to filter tasks by status (`pending` / `completed`) and automatic descending sort by creation timestamp.

---

## 2. Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework.
- **MongoDB**: NoSQL document database.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
- **dotenv**: Environment variable management.
- **cors**: Cross-Origin Resource Sharing middleware.
- **nodemon**: Development server with automatic reload.
- **Postman**: API testing and endpoint documentation.

---

## 3. Project Structure

```text
todo-rest-api/
├── postman/
│   └── Todo_API.postman_collection.json
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB Mongoose connection
│   ├── controllers/
│   │   └── taskController.js  # Request handlers for task CRUD
│   ├── middleware/
│   │   └── errorHandler.js    # Centralized error handler
│   ├── models/
│   │   └── Task.js            # Mongoose schema and model for tasks
│   ├── routes/
│   │   └── taskRoutes.js      # REST API route declarations
│   ├── app.js                 # Express app setup and middleware
│   └── server.js              # Server entry point & DB connection
├── tests/
│   └── task.test.js           # Automated end-to-end integration tests
├── .env.example               # Template for environment variables
├── .gitignore                 # Files excluded from git
├── package.json               # Node.js project manifest & scripts
└── README.md                  # Comprehensive documentation
```

---

## 4. Environment Variables Configuration

Create a `.env` file in the root of the `todo-rest-api` folder based on `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables Table

| Variable | Description | Default / Example Value |
| :--- | :--- | :--- |
| `PORT` | Port number on which Express listens | `5001` |
| `MONGODB_URI` | MongoDB connection string (Local or MongoDB Atlas) | `mongodb://127.0.0.1:27017/todo_db` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |

> **MongoDB Setup Note**:
> - If using a **Local MongoDB instance**, ensure the MongoDB service is running on `mongodb://127.0.0.1:27017/todo_db`.
> - If using **MongoDB Atlas**, obtain your cluster connection string and replace `<username>` and `<password>`:
>   `mongodb+srv://<username>:<password>@cluster.mongodb.net/todo_db?retryWrites=true&w=majority`

---

## 5. Installation and Running the Server

### Step 1: Navigate to Project Directory
```bash
cd todo-rest-api
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` and adjust values if necessary:
```bash
copy .env.example .env   # On Windows
cp .env.example .env     # On Linux / macOS
```

### Step 4: Run the Server
- **Development mode** (with nodemon auto-restart):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```

Once running, the console will display:
```text
[MongoDB] Connected successfully: 127.0.0.1:27017/todo_db
[Server] To-Do API running in development mode on port 5001
```

---

## 6. API Endpoints Specification

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Health Check and metadata | `200` |
| `POST` | `/api/tasks` | Create a new task | `201`, `400` |
| `GET` | `/api/tasks` | Retrieve all tasks (optional `?status=pending\|completed`) | `200`, `400` |
| `GET` | `/api/tasks/:id` | Retrieve a single task by ID | `200`, `400`, `404` |
| `PUT` | `/api/tasks/:id` | Update an existing task | `200`, `400`, `404` |
| `DELETE` | `/api/tasks/:id` | Delete a task by ID | `200`, `400`, `404` |

---

## 7. Expected Request and Response Examples

### 1. Create a Task (POST `/api/tasks`)
**Request Header:** `Content-Type: application/json`
```json
{
  "title": "Complete Week 2 Backend Assignment",
  "description": "Implement all 3 assignments with proper Mongoose models",
  "status": "pending"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "672e42bc56fe1c028a38b1d9",
    "title": "Complete Week 2 Backend Assignment",
    "description": "Implement all 3 assignments with proper Mongoose models",
    "status": "pending",
    "createdAt": "2026-11-08T18:15:24.000Z",
    "updatedAt": "2026-11-08T18:15:24.000Z",
    "__v": 0
  }
}
```

### 2. Validation Failure (POST `/api/tasks` with missing title)
```json
{
  "description": "Missing title"
}
```
**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Task title is required and cannot be empty"
}
```

### 3. Get All Tasks (GET `/api/tasks`)
**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "672e42bc56fe1c028a38b1d9",
      "title": "Complete Week 2 Backend Assignment",
      "description": "Implement all 3 assignments with proper Mongoose models",
      "status": "pending",
      "createdAt": "2026-11-08T18:15:24.000Z",
      "updatedAt": "2026-11-08T18:15:24.000Z"
    }
  ]
}
```

### 4. Update a Task (PUT `/api/tasks/:id`)
**Request Body:**
```json
{
  "status": "completed"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "672e42bc56fe1c028a38b1d9",
    "title": "Complete Week 2 Backend Assignment",
    "description": "Implement all 3 assignments with proper Mongoose models",
    "status": "completed",
    "createdAt": "2026-11-08T18:15:24.000Z",
    "updatedAt": "2026-11-08T18:20:10.000Z"
  }
}
```

### 5. Delete a Task (DELETE `/api/tasks/:id`)
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": "672e42bc56fe1c028a38b1d9"
  }
}
```

### 6. Invalid ObjectId (GET `/api/tasks/not-valid-id`)
**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid task ID format"
}
```

---

## 8. Postman Testing Instructions

1. Open **Postman**.
2. Click **Import** in the top-left corner.
3. Select the file:
   `beeskilled-week2/todo-rest-api/postman/Todo_API.postman_collection.json`.
4. The collection contains 11 pre-configured requests covering:
   - Health check
   - Valid task creation
   - Validation failure cases (missing title, invalid status)
   - Fetching all tasks & filtering by status
   - Fetching a single task by ID
   - Handling invalid IDs (400) and nonexistent IDs (404)
   - Updating task status and fields
   - Deleting tasks and verifying deletion
5. Make sure the server is running on `http://localhost:5001`.
6. Run the collection using the **Postman Collection Runner** or execute requests sequentially.

---

## 9. Automated Testing

To run the automated end-to-end integration test suite (which launches an in-memory MongoDB instance and tests every endpoint without needing external databases):

```bash
npm test
```

