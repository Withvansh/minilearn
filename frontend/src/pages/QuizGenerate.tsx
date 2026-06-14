import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Course, Lesson } from '../types';
import { ArrowLeft, Sparkles, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export default function QuizGenerate() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // AI loading rotating status messages
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const loadingMessages = [
    'Analyzing lesson contents...',
    'Consulting Gemini 2.5 Flash...',
    'Formulating custom questions...',
    'Designing plausible distractors...',
    'Injecting correct solutions...',
    'Persisting quiz to platform database...'
  ];

  useEffect(() => {
    if (!courseId) return;
    const fetchCourseData = async () => {
      try {
        const courseData = await api.getCourse(courseId);
        setCourse(courseData);

        // Flatten all lessons
        const list: Lesson[] = [];
        courseData.sections?.forEach((sec) => {
          sec.lessons.forEach((les) => {
            list.push(les);
          });
        });
        setLessons(list);
        
        // Select all lessons by default
        setSelectedLessons(list.map((l) => l.id));
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  // Rotate loading messages while generating
  useEffect(() => {
    let interval: any;
    if (generating) {
      interval = setInterval(() => {
        setLoadingMessageIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleToggleLesson = (id: string) => {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedLessons(lessons.map((l) => l.id));
  };

  const handleDeselectAll = () => {
    setSelectedLessons([]);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    if (selectedLessons.length === 0) {
      setError('Please select at least one lesson to generate quiz questions.');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      await api.generateQuiz(courseId, count, selectedLessons);
      // Success! Redirect to attempt page
      navigate(`/courses/${courseId}/quiz/attempt`);
    } catch (err: any) {
      console.error('AI generation error:', err);
      if (err.response?.status === 429 || err.message?.includes('429') || err.message?.includes('Too many requests')) {
        setError('⚠️ Too many requests! You have exceeded the limit of 10 AI quiz generations per hour. Please wait a bit and try again.');
      } else {
        setError(err.message || 'An error occurred during quiz generation. Please verify your internet connection or key.');
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 flex-col gap-3">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-semibold">Loading parameters...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in relative">
      
      {/* Loading Overlay */}
      {generating && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-scale">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-900 text-lg">AI Quiz Generation</h3>
              <p className="text-sm text-indigo-600 font-bold flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{loadingMessages[loadingMessageIdx]}</span>
              </p>
            </div>
            
            <p className="text-xs text-slate-400">
              Generating quizzes via Gemini 2.5 Flash may take 5-15 seconds. Please do not close or refresh this page.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <Link
          to={`/courses/${courseId}`}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to curriculum
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 fill-indigo-100" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Configure AI Quiz
            </h1>
            <p className="text-xs text-slate-400">
              Select lessons to feed into the AI model to generate contextual test questions.
            </p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-sm font-semibold flex items-start gap-2.5 animate-scale">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Question Count Select */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">
              Number of Questions:
            </label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              {[3, 5, 8, 10].map((num) => (
                <option key={num} value={num}>
                  {num} Questions
                </option>
              ))}
            </select>
          </div>

          {/* Lessons selection checkboxes list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">
                Generate From Lessons:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300 text-xs">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {lessons.length > 0 ? (
              <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {lessons.map((les) => {
                  const isChecked = selectedLessons.includes(les.id);
                  return (
                    <label
                      key={les.id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 transition cursor-pointer text-xs sm:text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleLesson(les.id)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{les.title}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">
                No lessons available in this course.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl cursor-pointer transition shadow-md shadow-indigo-100 text-sm"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>Generate AI Quiz</span>
          </button>
        </form>
      </div>
    </div>
  );
}
