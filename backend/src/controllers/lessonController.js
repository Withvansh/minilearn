import { LessonService } from '../services/lessonService.js';

export class LessonController {
  static async createLesson(req, res, next) {
    try {
      const { id: sectionId } = req.params;
      const { title, content, order } = req.body;
      const lesson = await LessonService.createLesson(sectionId, { title, content, order });
      return res.status(201).json(lesson);
    } catch (error) {
      next(error);
    }
  }

  static async completeLesson(req, res, next) {
    try {
      const { id: lessonId } = req.params;
      const userId = req.headers['x-user-id'] || req.body.userId;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required in headers (x-user-id) or body.' });
      }

      const progress = await LessonService.completeLesson(lessonId, userId);
      return res.status(200).json(progress);
    } catch (error) {
      next(error);
    }
  }
}
