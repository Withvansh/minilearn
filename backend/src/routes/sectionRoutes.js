import { Router } from 'express';
import { LessonController } from '../controllers/lessonController.js';
import { validateRequest } from '../middleware/validate.js';
import { lessonCreateRules } from '../validators/rules.js';

const router = Router();

// POST /api/sections/:id/lessons - Create lesson inside section
router.post('/:id/lessons', lessonCreateRules, validateRequest, LessonController.createLesson);

export default router;
