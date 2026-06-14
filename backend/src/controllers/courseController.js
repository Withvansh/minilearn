import { CourseService } from '../services/courseService.js';

export class CourseController {
  static async getCourses(req, res, next) {
    try {
      const courses = await CourseService.getCourses();
      return res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  }

  static async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await CourseService.getCourseById(id);
      return res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  }

  static async createCourse(req, res, next) {
    try {
      const { title, description } = req.body;
      const course = await CourseService.createCourse({ title, description });
      return res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }

  static async enrollUser(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const userId = req.headers['x-user-id'] || req.body.userId;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required in headers (x-user-id) or body.' });
      }

      const enrollment = await CourseService.enrollUser(courseId, userId);
      return res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  }

  static async getCourseProgress(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const userId = req.headers['x-user-id'] || req.query.userId;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required in headers (x-user-id) or query parameters.' });
      }

      const progress = await CourseService.getCourseProgress(courseId, userId);
      return res.status(200).json(progress);
    } catch (error) {
      next(error);
    }
  }
}
