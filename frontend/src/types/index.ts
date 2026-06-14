export interface Course {
  id: string;
  title: string;
  description: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  content: string;
  order: number;
  completed?: boolean;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question_text: string;
  options: string[];
  correct_option_idx?: number;
}

export interface QuizAttemptResult {
  attemptId: string;
  isCorrect: boolean;
  correctOptionIdx: number;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}
