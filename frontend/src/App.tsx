import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import Header from './components/Header';
import Login from './pages/Login';
import CourseListing from './pages/CourseListing';
import CourseDetails from './pages/CourseDetails';
import LessonViewer from './pages/LessonViewer';
import QuizGenerate from './pages/QuizGenerate';
import QuizAttempt from './pages/QuizAttempt';
import QuizResult from './pages/QuizResult';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = !!localStorage.getItem('selectedUserId');
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const isAuthenticated = !!localStorage.getItem('selectedUserId');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Show header only if logged in */}
      {isAuthenticated && <Header />}
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          {/* Login Page */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><CourseListing /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
          <Route path="/lessons/:id" element={<ProtectedRoute><LessonViewer /></ProtectedRoute>} />
          <Route path="/courses/:courseId/quiz/generate" element={<ProtectedRoute><QuizGenerate /></ProtectedRoute>} />
          <Route path="/courses/:courseId/quiz/attempt" element={<ProtectedRoute><QuizAttempt /></ProtectedRoute>} />
          <Route path="/courses/:courseId/quiz/result" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
