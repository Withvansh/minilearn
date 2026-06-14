import db from '../db/knex.js';
import crypto from 'crypto';

export class SectionService {
  static async createSection(courseId, { title, order }) {
    // Verify course exists
    const course = await db('courses').where({ id: courseId }).first();
    if (!course) {
      const error = new Error('Course not found');
      error.status = 404;
      throw error;
    }

    const newSection = {
      id: crypto.randomUUID(),
      course_id: courseId,
      title,
      order: order || 0
    };

    await db('sections').insert(newSection);
    return newSection;
  }
}
