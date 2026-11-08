const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

process.env.JWT_SECRET = 'test_notes_jwt_secret_key_67890';
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
    console.log('\n--- Starting Assignment 3 Notes App Backend Automated Tests ---');
    console.log('[Setup] Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('[Setup] In-Memory MongoDB connected at', uri);

    // 1. Health check
    console.log('\n1. Testing Health Check (GET /):');
    const resHealth = await request(app).get('/');
    assert(resHealth.status === 200, 'Returns 200 OK');

    // 2. Register User A
    console.log('\n2. Registering User A (Alice):');
    const resRegUserA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Cooper',
        email: 'alice@example.com',
        password: 'AlicePassword123'
      });
    assert(resRegUserA.status === 201, 'User A registered successfully');
    const tokenA = resRegUserA.body.data.token;
    const userAId = resRegUserA.body.data.user._id;

    // 3. Register User B
    console.log('\n3. Registering User B (Bob):');
    const resRegUserB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'BobPassword123'
      });
    assert(resRegUserB.status === 201, 'User B registered successfully');
    const tokenB = resRegUserB.body.data.token;
    const userBId = resRegUserB.body.data.user._id;

    // 4. Notes access without token
    console.log('\n4. Testing Notes Access Without Token (GET /api/notes):');
    const resNoToken = await request(app).get('/api/notes');
    assert(resNoToken.status === 401, 'Returns 401 Unauthorized');

    // 5. Note creation validation (missing title/content)
    console.log('\n5. Testing Note Creation Validation (POST /api/notes):');
    const resMissingTitle = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ content: 'Content without title' });
    assert(resMissingTitle.status === 400, 'Returns 400 for missing title');

    // 6. User A creates a note
    console.log('\n6. User A Creates Note 1:');
    const resCreateNote1 = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Project Architecture',
        content: 'Clean MVC backend with Mongoose ODM.'
      });
    assert(resCreateNote1.status === 201, 'Returns 201 Created');
    assert(resCreateNote1.body.data.title === 'Project Architecture', 'Title matches');
    assert(resCreateNote1.body.data.user === userAId, 'Note is linked to User A');
    const note1Id = resCreateNote1.body.data._id;

    // 7. User A creates Note 2
    console.log('\n7. User A Creates Note 2:');
    const resCreateNote2 = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Security Guidelines',
        content: 'Always hash passwords and protect private endpoints.'
      });
    assert(resCreateNote2.status === 201, 'Note 2 created');

    // 8. User A retrieves their notes
    console.log('\n8. User A Retrieves All Notes:');
    const resNotesA = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(resNotesA.status === 200, 'Returns 200 OK');
    assert(resNotesA.body.count === 2, 'User A sees exactly 2 notes');

    // 9. User B retrieves all notes (should be 0 - data isolation!)
    console.log('\n9. Multi-Tenant Check: User B Retrieves All Notes:');
    const resNotesB = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${tokenB}`);
    assert(resNotesB.status === 200, 'Returns 200 OK');
    assert(resNotesB.body.count === 0, 'User B sees 0 notes (cannot see User A notes)');

    // 10. User A retrieves note 1 by ID
    console.log('\n10. User A Retrieves Note 1 by ID:');
    const resGetNoteA = await request(app)
      .get(`/api/notes/${note1Id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    assert(resGetNoteA.status === 200, 'Returns 200 OK');
    assert(resGetNoteA.body.data._id === note1Id, 'Correct note returned');

    // 11. User B attempts to retrieve User A's note by ID (403 Forbidden)
    console.log('\n11. Multi-Tenant Check: User B attempts to GET User A note by ID:');
    const resGetForbidden = await request(app)
      .get(`/api/notes/${note1Id}`)
      .set('Authorization', `Bearer ${tokenB}`);
    assert(resGetForbidden.status === 403, 'Returns 403 Forbidden');
    assert(resGetForbidden.body.message.includes('Forbidden'), 'Returns forbidden error message');

    // 12. User B attempts to update User A's note (403 Forbidden)
    console.log('\n12. Multi-Tenant Check: User B attempts to PUT User A note:');
    const resPutForbidden = await request(app)
      .put(`/api/notes/${note1Id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hacked by Bob' });
    assert(resPutForbidden.status === 403, 'Returns 403 Forbidden on update');

    // 13. User B attempts to delete User A's note (403 Forbidden)
    console.log('\n13. Multi-Tenant Check: User B attempts to DELETE User A note:');
    const resDelForbidden = await request(app)
      .delete(`/api/notes/${note1Id}`)
      .set('Authorization', `Bearer ${tokenB}`);
    assert(resDelForbidden.status === 403, 'Returns 403 Forbidden on delete');

    // 14. User A updates their own note
    console.log('\n14. User A Updates Their Note:');
    const resUpdateA = await request(app)
      .put(`/api/notes/${note1Id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Project Architecture - Updated' });
    assert(resUpdateA.status === 200, 'Returns 200 OK on update');
    assert(resUpdateA.body.data.title === 'Project Architecture - Updated', 'Title was updated');

    // 15. User A deletes their own note
    console.log('\n15. User A Deletes Their Note:');
    const resDeleteA = await request(app)
      .delete(`/api/notes/${note1Id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    assert(resDeleteA.status === 200, 'Returns 200 OK on delete');

    // 16. Verify note is deleted (404)
    console.log('\n16. Verification of Deleted Note:');
    const resVerifyDel = await request(app)
      .get(`/api/notes/${note1Id}`)
      .set('Authorization', `Bearer ${tokenA}`);
    assert(resVerifyDel.status === 404, 'Returns 404 Not Found after deletion');

    console.log(`\n========================================`);
    console.log(`Notes App API Test Results: ${passed} PASSED, ${failed} FAILED`);
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

