import { Router } from 'express';
import { CourseController } from '../controllers/courseController.js';
import { SectionController } from '../controllers/sectionController.js';
import { validateRequest } from '../middleware/validate.js';
import { courseCreateRules, sectionCreateRules, idParamRules } from '../validators/rules.js';

const router = Router();

// GET /api/courses - List all courses
router.get('/', CourseController.getCourses);

// POST /api/courses - Create a course
router.post('/', courseCreateRules, validateRequest, CourseController.createCourse);

// GET /api/courses/:id - Course detail with nested sections & lessons
router.get('/:id', idParamRules, validateRequest, CourseController.getCourseById);

// POST /api/courses/:id/sections - Add section to course
router.post('/:id/sections', sectionCreateRules, validateRequest, SectionController.createSection);

// POST /api/courses/:id/enroll - Enroll user in course
router.post('/:id/enroll', idParamRules, validateRequest, CourseController.enrollUser);

// GET /api/courses/:id/progress - Fetch user progress percentage
router.get('/:id/progress', idParamRules, validateRequest, CourseController.getCourseProgress);

export default router;
