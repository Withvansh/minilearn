import request from 'supertest';
import app from '../src/index.js';
import db from '../src/db/knex.js';

beforeAll(async () => {
  // Enforce test environment to use sqlite in-memory database
  process.env.NODE_ENV = 'test';

  // Run migrations to create schema in the in-memory SQLite database
  await db.migrate.latest();

  // Seed the in-memory database with the sample seeds
  await db.seed.run();
});

afterAll(async () => {
  // Tear down database connection after tests finish
  await db.destroy();
});

describe('Courses API Integration Test (GET /api/courses)', () => {
  it('should return 200 OK and list of courses with proper structure', async () => {
    const res = await request(app)
      .get('/api/courses');

    // 1. Verify status code is 200
    expect(res.statusCode).toBe(200);

    // 2. Verify response body is an array of courses
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // 3. Verify response structure for each course
    res.body.forEach((course) => {
      expect(course).toHaveProperty('id');
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('description');

      // Check types
      expect(typeof course.id).toBe('string');
      expect(typeof course.title).toBe('string');
      expect(typeof course.description).toBe('string');
    });

    // 4. Verify specific seeded courses are present
    const titles = res.body.map((c) => c.title);
    expect(titles).toContain('Introduction to JavaScript');
    expect(titles).toContain('Relational Database Design & SQL');
    expect(titles).toContain('Mastering Personal Finance');
  });
});
