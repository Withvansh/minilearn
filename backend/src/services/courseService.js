import db from '../db/knex.js';
import crypto from 'crypto';

export class CourseService {
  static async getCourses() {
    return db('courses').select('*');
  }

  static async getCourseById(courseId) {
    const course = await db('courses').where({ id: courseId }).first();
    if (!course) {
      const error = new Error('Course not found');
      error.status = 404;
      throw error;
    }

    const sections = await db('sections')
      .where({ course_id: courseId })
      .orderBy('order', 'asc');

    const sectionIds = sections.map((s) => s.id);
    let lessons = [];
    if (sectionIds.length > 0) {
      lessons = await db('lessons')
        .whereIn('section_id', sectionIds)
        .orderBy('order', 'asc');
    }

    // Nest lessons inside sections
    const nestedSections = sections.map((section) => ({
      ...section,
      lessons: lessons.filter((l) => l.section_id === section.id)
    }));

    return {
      ...course,
      sections: nestedSections
    };
  }

  static async createCourse({ title, description }) {
    const newCourse = {
      id: crypto.randomUUID(),
      title,
      description
    };
    await db('courses').insert(newCourse);
    return newCourse;
  }

  static async enrollUser(courseId, userId) {
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

    // Check if already enrolled
    const existing = await db('enrollments')
      .where({ user_id: userId, course_id: courseId })
      .first();
    
    if (existing) {
      return existing;
    }

    const newEnrollment = {
      id: crypto.randomUUID(),
      user_id: userId,
      course_id: courseId
    };

    await db('enrollments').insert(newEnrollment);
    return newEnrollment;
  }

  static async getCourseProgress(courseId, userId) {
    // Verify course exists
    const course = await db('courses').where({ id: courseId }).first();
    if (!course) {
      const error = new Error('Course not found');
      error.status = 404;
      throw error;
    }

    // Get all lessons belonging to this course
    const lessons = await db('lessons')
      .join('sections', 'lessons.section_id', 'sections.id')
      .where('sections.course_id', courseId)
      .select('lessons.id');

    const lessonIds = lessons.map((l) => l.id);
    const totalLessons = lessonIds.length;

    if (totalLessons === 0) {
      return {
        totalLessons: 0,
        completedLessons: 0,
        progressPercentage: 0
      };
    }

    // Count completed lessons for the user in this list
    const progressRecords = await db('lesson_progress')
      .where({ user_id: userId, completed: true })
      .whereIn('lesson_id', lessonIds);

    const completedLessons = progressRecords.length;
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    return {
      totalLessons,
      completedLessons,
      progressPercentage
    };
  }
}
