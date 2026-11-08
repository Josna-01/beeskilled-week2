const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');

let mongoServer;

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✓ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    console.log('\n--- Starting Assignment 1 To-Do API Automated Tests ---');
    console.log('[Setup] Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('[Setup] In-Memory MongoDB connected at', uri);

    // 1. Health check
    console.log('\n1. Testing Health Check Endpoint (GET /):');
    const resHealth = await request(app).get('/');
    assert(resHealth.status === 200, 'Returns 200 OK');
    assert(resHealth.body.success === true, 'Returns success: true');

    // 2. POST /api/tasks - Validation error (missing title)
    console.log('\n2. Testing Task Creation Validation (POST /api/tasks with missing title):');
    const resMissingTitle = await request(app)
      .post('/api/tasks')
      .send({ description: 'No title' });
    assert(resMissingTitle.status === 400, 'Returns 400 Bad Request');
    assert(resMissingTitle.body.success === false, 'Returns success: false');

    // 3. POST /api/tasks - Validation error (invalid status)
    console.log('\n3. Testing Task Creation Validation (POST /api/tasks with invalid status):');
    const resInvalidStatus = await request(app)
      .post('/api/tasks')
      .send({ title: 'Invalid status task', status: 'done-zo' });
    assert(resInvalidStatus.status === 400, 'Returns 400 Bad Request for bad status');

    // 4. POST /api/tasks - Valid task creation
    console.log('\n4. Testing Valid Task Creation (POST /api/tasks):');
    const resCreate = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Learn MERN Backend',
        description: 'Implement Week 2 assignments properly',
        status: 'pending'
      });
    assert(resCreate.status === 201, 'Returns 201 Created');
    assert(resCreate.body.success === true, 'Returns success: true');
    assert(resCreate.body.data.title === 'Learn MERN Backend', 'Title matches');
    assert(resCreate.body.data.status === 'pending', 'Status defaults to pending');
    const taskId = resCreate.body.data._id;

    // 5. GET /api/tasks - Retrieve all tasks
    console.log('\n5. Testing Retrieve All Tasks (GET /api/tasks):');
    const resGetAll = await request(app).get('/api/tasks');
    assert(resGetAll.status === 200, 'Returns 200 OK');
    assert(resGetAll.body.success === true, 'Returns success: true');
    assert(Array.isArray(resGetAll.body.data), 'Returns an array of tasks');
    assert(resGetAll.body.count === 1, 'Task count is 1');

    // 6. GET /api/tasks/:id - Retrieve single task
    console.log('\n6. Testing Retrieve Single Task (GET /api/tasks/:id):');
    const resGetSingle = await request(app).get(`/api/tasks/${taskId}`);
    assert(resGetSingle.status === 200, 'Returns 200 OK');
    assert(resGetSingle.body.data._id === taskId, 'Task ID matches');

    // 7. GET /api/tasks/:id - Invalid ID format
    console.log('\n7. Testing Invalid Task ID Format (GET /api/tasks/not-a-valid-id):');
    const resInvalidId = await request(app).get('/api/tasks/123-bad-id');
    assert(resInvalidId.status === 400, 'Returns 400 Bad Request for malformed ID');

    // 8. GET /api/tasks/:id - Non-existent ID (404)
    console.log('\n8. Testing Non-existent Task ID (GET /api/tasks/60d0fe4f5311236168a109ca):');
    const fakeId = new mongoose.Types.ObjectId();
    const resNotFound = await request(app).get(`/api/tasks/${fakeId}`);
    assert(resNotFound.status === 404, 'Returns 404 Not Found');

    // 9. PUT /api/tasks/:id - Update task
    console.log('\n9. Testing Update Task (PUT /api/tasks/:id):');
    const resUpdate = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'completed' });
    assert(resUpdate.status === 200, 'Returns 200 OK');
    assert(resUpdate.body.data.status === 'completed', 'Task status updated to completed');

    // 10. GET /api/tasks?status=completed - Filtering
    console.log('\n10. Testing Filter Tasks by Status (GET /api/tasks?status=completed):');
    const resFilter = await request(app).get('/api/tasks?status=completed');
    assert(resFilter.status === 200, 'Returns 200 OK');
    assert(resFilter.body.count === 1, 'Found 1 completed task');

    // 11. DELETE /api/tasks/:id - Delete task
    console.log('\n11. Testing Delete Task (DELETE /api/tasks/:id):');
    const resDelete = await request(app).delete(`/api/tasks/${taskId}`);
    assert(resDelete.status === 200, 'Returns 200 OK');
    assert(resDelete.body.success === true, 'Returns success: true');

    // 12. Verify deleted task returns 404
    console.log('\n12. Testing Verification of Deleted Task (GET /api/tasks/:id):');
    const resVerifyDelete = await request(app).get(`/api/tasks/${taskId}`);
    assert(resVerifyDelete.status === 404, 'Returns 404 Not Found after deletion');

    console.log(`\n========================================`);
    console.log(`To-Do API Test Results: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
};

runTests();

