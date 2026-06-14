import { QuizService } from '../services/quizService.js';
import { AiQuizService } from '../services/aiQuizService.js';

export class QuizController {
  static async getCourseQuiz(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const questions = await QuizService.getCourseQuiz(courseId);
      return res.status(200).json(questions);
    } catch (error) {
      next(error);
    }
  }

  static async attemptQuiz(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const userId = req.headers['x-user-id'] || req.body.userId;
      const { quizQuestionId, selectedOptionIdx } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required in headers (x-user-id) or body.' });
      }

      const attemptResult = await QuizService.attemptQuiz(courseId, userId, {
        quizQuestionId,
        selectedOptionIdx
      });
      return res.status(201).json(attemptResult);
    } catch (error) {
      next(error);
    }
  }

  static async generateQuizFromLessons(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const { count, lessonIds } = req.body;
      const questions = await AiQuizService.generateQuizFromLessons(courseId, { count, lessonIds });
      return res.status(201).json(questions);
    } catch (error) {
      next(error);
    }
  }
}
