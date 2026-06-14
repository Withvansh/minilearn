import { body, param } from 'express-validator';

export const courseCreateRules = [
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('description').optional().trim()
];

export const sectionCreateRules = [
  param('id').isUUID().withMessage('Valid course ID (UUID) is required in parameters'),
  body('title').trim().notEmpty().withMessage('Section title is required'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
];

export const lessonCreateRules = [
  param('id').isUUID().withMessage('Valid section ID (UUID) is required in parameters'),
  body('title').trim().notEmpty().withMessage('Lesson title is required'),
  body('content').optional().trim(),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
];

export const idParamRules = [
  param('id').isUUID().withMessage('Valid ID (UUID) is required in parameters')
];

export const quizAttemptRules = [
  param('id').isUUID().withMessage('Valid course ID (UUID) is required in parameters'),
  body('quizQuestionId').isUUID().withMessage('Valid quizQuestionId (UUID) is required'),
  body('selectedOptionIdx').isInt({ min: 0 }).withMessage('selectedOptionIdx must be a non-negative integer')
];

export const quizGenerateRules = [
  param('id').isUUID().withMessage('Valid course ID (UUID) is required in parameters'),
  body('count').optional().isInt({ min: 1, max: 20 }).withMessage('Count must be an integer between 1 and 20'),
  body('lessonIds').optional().isArray().withMessage('lessonIds must be an array of UUIDs'),
  body('lessonIds.*').optional().isUUID().withMessage('Each lessonId must be a valid UUID')
];
