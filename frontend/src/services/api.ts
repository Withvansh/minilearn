import axios from 'axios';
import { Course, QuizQuestion, QuizAttemptResult, CourseProgress } from '../types';

const client = axios.create({
  baseURL: ''
});

// Automatically inject selected user ID in header for auth simulation
client.interceptors.request.use((config) => {
  const selectedUserId = localStorage.getItem('selectedUserId');
  if (selectedUserId) {
    config.headers['x-user-id'] = selectedUserId;
  }
  return config;
});

export interface UserResponse {
  id: string;
  username: string;
  email: string;
}

export const api = {
  getUsers: async (): Promise<UserResponse[]> => {
    const res = await client.get('/api/users');
    return res.data;
  },

  loginWithGoogle: async (idToken: string): Promise<UserResponse> => {
    const res = await client.post('/api/auth/google', { idToken });
    return res.data;
  },

  getCourses: async (): Promise<Course[]> => {
    const res = await client.get('/api/courses');
    return res.data;
  },

  getCourse: async (id: string): Promise<Course> => {
    const res = await client.get(`/api/courses/${id}`);
    return res.data;
  },

  createCourse: async (title: string, description: string): Promise<Course> => {
    const res = await client.post('/api/courses', { title, description });
    return res.data;
  },

  createSection: async (courseId: string, title: string, order: number): Promise<any> => {
    const res = await client.post(`/api/courses/${courseId}/sections`, { title, order });
    return res.data;
  },

  createLesson: async (sectionId: string, title: string, content: string, order: number): Promise<any> => {
    const res = await client.post(`/api/sections/${sectionId}/lessons`, { title, content, order });
    return res.data;
  },

  enroll: async (courseId: string): Promise<any> => {
    const res = await client.post(`/api/courses/${courseId}/enroll`);
    return res.data;
  },

  completeLesson: async (lessonId: string): Promise<any> => {
    const res = await client.post(`/api/lessons/${lessonId}/complete`);
    return res.data;
  },

  getProgress: async (courseId: string): Promise<CourseProgress> => {
    const res = await client.get(`/api/courses/${courseId}/progress`);
    return res.data;
  },

  getQuiz: async (courseId: string): Promise<QuizQuestion[]> => {
    const res = await client.get(`/api/courses/${courseId}/quiz`);
    return res.data;
  },

  attemptQuiz: async (
    courseId: string,
    quizQuestionId: string,
    selectedOptionIdx: number
  ): Promise<QuizAttemptResult> => {
    const res = await client.post(`/api/courses/${courseId}/quiz/attempt`, {
      quizQuestionId,
      selectedOptionIdx
    });
    return res.data;
  },

  generateQuiz: async (courseId: string, count: number, lessonIds?: string[]): Promise<QuizQuestion[]> => {
    const res = await client.post(`/api/courses/${courseId}/quiz/generate-from-lessons`, {
      count,
      lessonIds
    });
    return res.data;
  }
};
