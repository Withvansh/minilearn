import db from '../db/knex.js';
import crypto from 'crypto';

export class QuizService {
  static async getCourseQuiz(courseId) {
    // Verify course exists
    const course = await db('courses').where({ id: courseId }).first();
    if (!course) {
      const error = new Error('Course not found');
      error.status = 404;
      throw error;
    }

    // Get all quiz questions for lessons in this course
    const questions = await db('quiz_questions')
      .join('lessons', 'quiz_questions.lesson_id', 'lessons.id')
      .join('sections', 'lessons.section_id', 'sections.id')
      .where('sections.course_id', courseId)
      .select(
        'quiz_questions.id',
        'quiz_questions.lesson_id',
        'quiz_questions.question_text',
        'quiz_questions.options',
        'quiz_questions.correct_option_idx'
      );

    // Parse options from JSON string
    return questions.map((q) => {
      let optionsArray = [];
      try {
        optionsArray = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      } catch (e) {
        optionsArray = [];
      }
      return {
        ...q,
        options: optionsArray
      };
    });
  }

  static async attemptQuiz(courseId, userId, { quizQuestionId, selectedOptionIdx }) {
    // Verify course exists
    const course = await db('courses').where({ id: courseId }).first();
    if (!course) {
      const error = new Error('Course not found');
      error.status = 404;
      throw error;
    }

    // Verify user exists
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Fetch quiz question details
    const question = await db('quiz_questions')
      .join('lessons', 'quiz_questions.lesson_id', 'lessons.id')
      .join('sections', 'lessons.section_id', 'sections.id')
      .where('quiz_questions.id', quizQuestionId)
      .andWhere('sections.course_id', courseId)
      .select('quiz_questions.id', 'quiz_questions.correct_option_idx')
      .first();

    if (!question) {
      const error = new Error('Quiz question not found in this course');
      error.status = 404;
      throw error;
    }

    const isCorrect = selectedOptionIdx === question.correct_option_idx;

    const newAttempt = {
      id: crypto.randomUUID(),
      user_id: userId,
      quiz_question_id: quizQuestionId,
      selected_option_idx: selectedOptionIdx,
      is_correct: isCorrect
    };

    await db('quiz_attempts').insert(newAttempt);

    return {
      attemptId: newAttempt.id,
      isCorrect,
      correctOptionIdx: question.correct_option_idx
    };
  }
}
