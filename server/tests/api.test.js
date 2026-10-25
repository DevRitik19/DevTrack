const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Goal = require('../src/models/Goal');
const ActivityLog = require('../src/models/ActivityLog');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Project.deleteMany({});
  await Goal.deleteMany({});
  await ActivityLog.deleteMany({});
});

describe('DevTrack Backend API Tests', () => {
  describe('Authentication Flows', () => {
    const testUser = {
      username: 'alice_dev',
      email: 'alice@example.com',
      password: 'password123',
      name: 'Alice Developer',
    };

    it('should register a new user, return user data without password, and set token cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.password).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject registration if email is already registered', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app).post('/api/auth/register').send({
        username: 'alice_different',
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email already exists/i);
    });

    it('should log in an existing user with correct credentials', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail login with wrong password', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'incorrectPassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return current user via /api/auth/me when authenticated', async () => {
      const regRes = await request(app).post('/api/auth/register').send(testUser);
      const token = regRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe(testUser.username);
    });

    it('should reject /api/auth/me without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Project Management & Strict Ownership Enforcement', () => {
    let user1Token;
    let user2Token;

    beforeEach(async () => {
      const u1 = await request(app).post('/api/auth/register').send({
        username: 'user_one',
        email: 'u1@example.com',
        password: 'password123',
      });
      user1Token = u1.body.token;

      const u2 = await request(app).post('/api/auth/register').send({
        username: 'user_two',
        email: 'u2@example.com',
        password: 'password123',
      });
      user2Token = u2.body.token;
    });

    it('should allow user to create, read, update, and delete their own project', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'DevTrack Hub',
          description: 'MERN Developer Progress Tracker',
          technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
          status: 'In Progress',
          completionPercentage: 70,
        });

      expect(createRes.status).toBe(201);
      const projectId = createRes.body.data._id;
      expect(createRes.body.data.title).toBe('DevTrack Hub');

      // Read
      const getRes = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.count).toBe(1);

      // Update
      const patchRes = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          completionPercentage: 100,
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.completionPercentage).toBe(100);
      expect(patchRes.body.data.status).toBe('Completed'); // Auto-adjusted status

      // Delete
      const delRes = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(delRes.status).toBe(200);

      // Verify deletion
      const checkRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(checkRes.status).toBe(404);
    });

    it('should prevent user 2 from modifying or deleting user 1 project', async () => {
      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'User 1 Private Work',
          status: 'Planned',
        });

      const projectId = createRes.body.data._id;

      // User 2 attempts to get User 1 project
      const getRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(getRes.status).toBe(404);

      // User 2 attempts to update User 1 project
      const patchRes = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hacked Title' });

      expect(patchRes.status).toBe(404);

      // User 2 attempts to delete User 1 project
      const delRes = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(delRes.status).toBe(404);
    });
  });

  describe('Goals & Learning Tracker', () => {
    let token;

    beforeEach(async () => {
      const u = await request(app).post('/api/auth/register').send({
        username: 'goal_getter',
        email: 'goals@example.com',
        password: 'password123',
      });
      token = u.body.token;
    });

    it('should create goal and auto-mark completed when target is met', async () => {
      const createRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Solve 50 LeetCode Problems',
          targetValue: 50,
          currentValue: 20,
          unit: 'problems',
          category: 'DSA & LeetCode',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.data.status).toBe('Active');

      const goalId = createRes.body.data._id;

      // Update currentValue to 50
      const patchRes = await request(app)
        .patch(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentValue: 50,
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.status).toBe('Completed');
      expect(patchRes.body.data.completedAt).toBeDefined();
    });
  });

  describe('Public Developer Profile Privacy', () => {
    let token;

    beforeEach(async () => {
      const u = await request(app).post('/api/auth/register').send({
        username: 'dev_hero',
        email: 'secret_email@example.com',
        password: 'password123',
        name: 'Dev Hero',
      });
      token = u.body.token;

      // Add a public project
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Public Open Source App',
          isPublic: true,
          status: 'Completed',
        });

      // Add a private project
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Secret Internal Tool',
          isPublic: false,
          status: 'In Progress',
        });
    });

    it('should return public profile without exposing email, password, or private projects', async () => {
      const res = await request(app).get('/api/users/dev_hero/public');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('dev_hero');
      expect(res.body.data.email).toBeUndefined(); // EMAIL MUST NEVER BE EXPOSED
      expect(res.body.data.password).toBeUndefined();

      // Only the public project should appear
      expect(res.body.data.projects.length).toBe(1);
      expect(res.body.data.projects[0].title).toBe('Public Open Source App');
    });

    it('should return 404 for non-existent profile', async () => {
      const res = await request(app).get('/api/users/non_existent_user_9999/public');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
