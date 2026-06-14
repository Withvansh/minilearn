import { Router } from 'express';
import { LessonController } from '../controllers/lessonController.js';
import { validateRequest } from '../middleware/validate.js';
import { idParamRules } from '../validators/rules.js';

const router = Router();

// POST /api/lessons/:id/complete - Complete a lesson
router.post('/:id/complete', idParamRules, validateRequest, LessonController.completeLesson);

export default router;
