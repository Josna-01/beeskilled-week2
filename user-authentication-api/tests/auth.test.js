const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../src/models/User');

// Set dummy JWT secret for tests
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.JWT_EXPIRES_IN = '1d';

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
    console.log('\n--- Starting Assignment 2 User Authentication API Tests ---');
    console.log('[Setup] Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('[Setup] In-Memory MongoDB connected at', uri);

    // 1. Health check
    console.log('\n1. Testing Health Check (GET /):');
    const resHealth = await request(app).get('/');
    assert(resHealth.status === 200, 'Returns 200 OK');

    // 2. Register with missing fields
    console.log('\n2. Testing Validation - Missing Fields (POST /api/auth/register):');
    const resMissing = await request(app)
      .post('/api/auth/register')
      .send({ email: 'missingname@example.com' });
    assert(resMissing.status === 400, 'Returns 400 Bad Request');
    assert(resMissing.body.success === false, 'Returns success: false');

    // 3. Register with short password
    console.log('\n3. Testing Validation - Short Password (POST /api/auth/register):');
    const resShortPass = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short', email: 'short@example.com', password: '123' });
    assert(resShortPass.status === 400, 'Returns 400 for password < 6 chars');

    // 4. Register valid user
    console.log('\n4. Testing Valid User Registration (POST /api/auth/register):');
    const resRegister = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'Password123'
      });
    assert(resRegister.status === 201, 'Returns 201 Created');
    assert(resRegister.body.success === true, 'Returns success: true');
    assert(Boolean(resRegister.body.data.token), 'Returns JWT token');
    assert(resRegister.body.data.user.email === 'alice@example.com', 'Returns user email');
    assert(resRegister.body.data.user.password === undefined, 'Password is NOT exposed in response');

    let userToken = resRegister.body.data.token;

    // 5. Verify password in MongoDB is hashed
    console.log('\n5. Verifying Password Hashing in Database:');
    const dbUser = await User.findOne({ email: 'alice@example.com' });
    assert(dbUser !== null, 'User found in database');
    assert(dbUser.password !== 'Password123', 'Password is NOT stored in plain text');
    assert(dbUser.password.startsWith('$2'), 'Password has valid bcrypt hash signature');

    // 6. Duplicate email registration
    console.log('\n6. Testing Duplicate Email Registration (POST /api/auth/register):');
    const resDuplicate = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Duplicate',
        email: 'alice@example.com',
        password: 'AnotherPassword123'
      });
    assert(resDuplicate.status === 400, 'Returns 400 Bad Request for duplicate email');
    assert(resDuplicate.body.message.includes('already exists'), 'Duplicate message returned');

    // 7. Login with valid credentials
    console.log('\n7. Testing Login - Valid Credentials (POST /api/auth/login):');
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'Password123'
      });
    assert(resLogin.status === 200, 'Returns 200 OK');
    assert(Boolean(resLogin.body.data.token), 'Returns valid JWT token');
    assert(resLogin.body.data.user.password === undefined, 'Password omitted in response');
    userToken = resLogin.body.data.token;

    // 8. Login with wrong password
    console.log('\n8. Testing Login - Wrong Password (POST /api/auth/login):');
    const resWrongPass = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'WrongPassword999'
      });
    assert(resWrongPass.status === 401, 'Returns 401 Unauthorized for bad password');

    // 9. Login with non-existent email
    console.log('\n9. Testing Login - Non-existent Email (POST /api/auth/login):');
    const resNoUser = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'Password123'
      });
    assert(resNoUser.status === 401, 'Returns 401 Unauthorized for unknown email');

    // 10. Access protected profile route with valid token
    console.log('\n10. Testing Protected Profile Access (GET /api/auth/profile with Bearer Token):');
    const resProfile = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${userToken}`);
    assert(resProfile.status === 200, 'Returns 200 OK');
    assert(resProfile.body.data.email === 'alice@example.com', 'Profile matches authenticated user');
    assert(resProfile.body.data.password === undefined, 'Password is NOT exposed');

    // 11. Access protected profile without token
    console.log('\n11. Testing Protected Profile Without Token (GET /api/auth/profile):');
    const resNoToken = await request(app).get('/api/auth/profile');
    assert(resNoToken.status === 401, 'Returns 401 Unauthorized when token missing');

    // 12. Access protected profile with invalid token
    console.log('\n12. Testing Protected Profile With Invalid Token (GET /api/auth/profile):');
    const resBadToken = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer this.is.an.invalid.token');
    assert(resBadToken.status === 401, 'Returns 401 Unauthorized for bad token');

    console.log(`\n========================================`);
    console.log(`User Auth API Test Results: ${passed} PASSED, ${failed} FAILED`);
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
