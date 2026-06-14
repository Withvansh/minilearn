import db from '../db/knex.js';
import crypto from 'crypto';

export class LessonService {
  static async createLesson(sectionId, { title, content, order }) {
    // Verify section exists
    const section = await db('sections').where({ id: sectionId }).first();
    if (!section) {
      const error = new Error('Section not found');
      error.status = 404;
      throw error;
    }

    const newLesson = {
      id: crypto.randomUUID(),
      section_id: sectionId,
      title,
      content,
      order: order || 0
    };

    await db('lessons').insert(newLesson);
    return newLesson;
  }

  static async completeLesson(lessonId, userId) {
    // Verify lesson exists
    const lesson = await db('lessons').where({ id: lessonId }).first();
    if (!lesson) {
      const error = new Error('Lesson not found');
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

    const now = new Date();

    // Check if progress already exists
    const existing = await db('lesson_progress')
      .where({ user_id: userId, lesson_id: lessonId })
      .first();

    if (existing) {
      if (!existing.completed) {
        await db('lesson_progress')
          .where({ id: existing.id })
          .update({
            completed: true,
            completed_at: now,
            updated_at: now
          });
        existing.completed = true;
        existing.completed_at = now;
      }
      return existing;
    }

    const newProgress = {
      id: crypto.randomUUID(),
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: now
    };

    await db('lesson_progress').insert(newProgress);
    return newProgress;
  }
}
