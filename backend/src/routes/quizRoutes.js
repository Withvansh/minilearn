import { Router } from 'express';
import { QuizController } from '../controllers/quizController.js';
import { validateRequest } from '../middleware/validate.js';
import { idParamRules, quizAttemptRules, quizGenerateRules } from '../validators/rules.js';
import { aiQuizRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// GET /api/courses/:id/quiz - Get all quizzes belonging to a course
router.get('/courses/:id/quiz', idParamRules, validateRequest, QuizController.getCourseQuiz);

// POST /api/courses/:id/quiz/attempt - Attempt a quiz question
router.post('/courses/:id/quiz/attempt', quizAttemptRules, validateRequest, QuizController.attemptQuiz);

// POST /api/courses/:id/quiz/generate-from-lessons - Generate questions using OpenAI
router.post('/courses/:id/quiz/generate-from-lessons', quizGenerateRules, validateRequest, aiQuizRateLimiter, QuizController.generateQuizFromLessons);

export default router;
