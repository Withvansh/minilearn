import request from 'supertest';
import app from '../src/index.js';
import db from '../src/db/knex.js';
import crypto from 'crypto';

let userId = crypto.randomUUID();
let courseId = '';
let sectionId = '';
let lessonId = '';
let questionId = '';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await db.migrate.latest();

  // Create a test user in DB
  await db('users').insert({
    id: userId,
    username: 'teststudent',
    email: 'student@test.com',
    password_hash: 'hashedpass'
  });
});

afterAll(async () => {
  await db.destroy();
});

describe('MiniLearn Restructured API Endpoints', () => {
  it('should create a new course (POST /api/courses)', async () => {
    const res = await request(app)
      .post('/api/courses')
      .send({
        title: 'Jest Testing Basics',
        description: 'Learn how to write unit and integration tests.'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toEqual('Jest Testing Basics');
    courseId = res.body.id;
  });

  it('should fail creating course with invalid title', async () => {
    const res = await request(app)
      .post('/api/courses')
      .send({
        title: '',
        description: 'No title.'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should create a section under course (POST /api/courses/:id/sections)', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/sections`)
      .send({
        title: 'Module 1: Setup',
        order: 1
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual('Module 1: Setup');
    expect(res.body.course_id).toEqual(courseId);
    sectionId = res.body.id;
  });

  it('should create a lesson under section (POST /api/sections/:id/lessons)', async () => {
    const res = await request(app)
      .post(`/api/sections/${sectionId}/lessons`)
      .send({
        title: 'Installing Jest',
        content: 'Run npm install -D jest to setup.',
        order: 1
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual('Installing Jest');
    expect(res.body.section_id).toEqual(sectionId);
    lessonId = res.body.id;
  });

  it('should enroll a user in the course (POST /api/courses/:id/enroll)', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/enroll`)
      .set('x-user-id', userId);

    expect(res.statusCode).toEqual(201);
    expect(res.body.course_id).toEqual(courseId);
    expect(res.body.user_id).toEqual(userId);
  });

  it('should list all courses (GET /api/courses)', async () => {
    const res = await request(app).get('/api/courses');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toEqual('Jest Testing Basics');
  });

  it('should fetch course detail with sections and lessons (GET /api/courses/:id)', async () => {
    const res = await request(app).get(`/api/courses/${courseId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual('Jest Testing Basics');
    expect(res.body.sections.length).toEqual(1);
    expect(res.body.sections[0].lessons.length).toEqual(1);
    expect(res.body.sections[0].lessons[0].title).toEqual('Installing Jest');
  });

  it('should complete a lesson for enrolled user (POST /api/lessons/:id/complete)', async () => {
    const res = await request(app)
      .post(`/api/lessons/${lessonId}/complete`)
      .set('x-user-id', userId);

    expect(res.statusCode).toEqual(200);
    expect(res.body.completed).toEqual(true); // returns true
  });

  it('should fetch user course progress percentage (GET /api/courses/:id/progress)', async () => {
    const res = await request(app)
      .get(`/api/courses/${courseId}/progress`)
      .set('x-user-id', userId);

    expect(res.statusCode).toEqual(200);
    expect(res.body.totalLessons).toEqual(1);
    expect(res.body.completedLessons).toEqual(1);
    expect(res.body.progressPercentage).toEqual(100);
  });

  it('should get course quiz bank (GET /api/courses/:id/quiz)', async () => {
    // Add a quiz question to lesson first to make it retrievable
    const [qId] = await db('quiz_questions').insert({
      id: crypto.randomUUID(),
      lesson_id: lessonId,
      question_text: 'What NPM command installs Jest?',
      options: JSON.stringify(['npm i jest', 'npm install -D jest', 'npm jest install', 'yarn jest']),
      correct_option_idx: 1
    }).returning('id');
    const actualQId = typeof qId === 'object' ? (qId.id || qId) : qId;
    questionId = actualQId;

    const res = await request(app).get(`/api/courses/${courseId}/quiz`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0].question_text).toEqual('What NPM command installs Jest?');
  });

  it('should attempt a quiz question and check correctness (POST /api/courses/:id/quiz/attempt)', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/quiz/attempt`)
      .set('x-user-id', userId)
      .send({
        quizQuestionId: questionId,
        selectedOptionIdx: 1
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.isCorrect).toEqual(true);
    expect(res.body.correctOptionIdx).toEqual(1);
  });

  it('should generate quiz questions using OpenAI service mock (POST /api/courses/:id/quiz/generate-from-lessons)', async () => {
    const res = await request(app)
      .post(`/api/courses/${courseId}/quiz/generate-from-lessons`)
      .send({
        count: 3,
        lessonIds: [lessonId]
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0].lesson_id).toEqual(lessonId);
    expect(res.body[0]).toHaveProperty('question_text');
    expect(res.body[0].options.length).toEqual(4);
    expect(res.body[0]).toHaveProperty('correct_option_idx');
  });

  it('should enforce rate limiting after 10 requests (POST /api/courses/:id/quiz/generate-from-lessons)', async () => {
    let statusCodes = [];
    // We already fired 1 request in the test above. Fire 11 more to cross the limit of 10.
    for (let i = 0; i < 11; i++) {
      const res = await request(app)
        .post(`/api/courses/${courseId}/quiz/generate-from-lessons`)
        .send({
          count: 1,
          lessonIds: [lessonId]
        });
      statusCodes.push(res.statusCode);
    }

    const count429 = statusCodes.filter(c => c === 429).length;
    expect(count429).toBeGreaterThan(0);

    const lastRes = await request(app)
      .post(`/api/courses/${courseId}/quiz/generate-from-lessons`)
      .send({ count: 1 });
    
    expect(lastRes.statusCode).toEqual(429);
    expect(lastRes.body).toHaveProperty('error');
    expect(lastRes.body.error).toContain('Too many quiz generation requests');
  });
});
