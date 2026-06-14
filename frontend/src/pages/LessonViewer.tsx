import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Course, Section, Lesson } from '../types';
import { ArrowLeft, CheckCircle, ChevronRight, Sparkles } from 'lucide-react';

export default function LessonViewer() {
  const { id: lessonId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = localStorage.getItem('selectedUserId') || '';

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Flat list of all lessons in this course for next/prev navigation
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!lessonId || !userId) return;

    const findLessonAndCourse = async () => {
      setLoading(true);
      setSuccessMessage('');
      try {
        // Fetch all courses
        const coursesList = await api.getCourses();
        
        // Fetch nested structures in parallel to locate this lesson
        const details = await Promise.all(coursesList.map((c) => api.getCourse(c.id)));
        
        let foundCourse: Course | null = null;
        let foundSection: Section | null = null;
        let foundLesson: Lesson | null = null;

        for (const c of details) {
          if (c.sections) {
            for (const s of c.sections) {
              const match = s.lessons.find((l) => l.id === lessonId);
              if (match) {
                foundCourse = c;
                foundSection = s;
                foundLesson = match;
                break;
              }
            }
          }
          if (foundLesson) break;
        }

        if (foundCourse && foundSection && foundLesson) {
          setCourse(foundCourse);
          setCurrentSection(foundSection);
          setLesson(foundLesson);

          // Build flat list of all lessons in order
          const flat: Lesson[] = [];
          foundCourse.sections?.forEach((sec) => {
            sec.lessons.forEach((les) => {
              flat.push(les);
            });
          });
          setAllLessons(flat);
        } else {
          // Redirect if not found
          navigate('/');
        }

        // Load completions
        const compStr = localStorage.getItem(`completed_lessons_${userId}`);
        setCompletedLessons(compStr ? JSON.parse(compStr) : []);

      } catch (err) {
        console.error('Error loading lesson:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    findLessonAndCourse();
  }, [lessonId, userId, navigate]);

  const handleMarkComplete = async () => {
    if (!lessonId || !userId || !course) return;
    setMarkingComplete(true);
    try {
      await api.completeLesson(lessonId);
      
      // Update local storage registry
      const compStr = localStorage.getItem(`completed_lessons_${userId}`);
      const compList = compStr ? JSON.parse(compStr) : [];
      if (!compList.includes(lessonId)) {
        compList.push(lessonId);
        localStorage.setItem(`completed_lessons_${userId}`, JSON.stringify(compList));
      }
      setCompletedLessons(compList);
      setSuccessMessage('✨ Lesson completed successfully!');
      
      // Sync progress query on background to keep stats updated
      await api.getProgress(course.id);
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 flex-col gap-3">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-semibold">Opening lesson deck...</span>
      </div>
    );
  }

  if (!course || !currentSection || !lesson) return null;

  const currentIdx = allLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIdx !== -1 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  const isLessonCompleted = completedLessons.includes(lesson.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start animate-fade-in max-w-6xl mx-auto">
      
      {/* SYLLABUS SIDEBAR COLUMN */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="space-y-1">
          <Link
            to={`/courses/${course.id}`}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to syllabus
          </Link>
          <h3 className="font-extrabold text-slate-800 text-sm line-clamp-2">
            {course.title}
          </h3>
        </div>

        <hr className="border-slate-100" />

        {/* Syllabus structure */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {course.sections?.map((sec) => (
            <div key={sec.id} className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {sec.title}
              </span>
              <div className="space-y-1">
                {sec.lessons.map((les) => {
                  const isActive = les.id === lesson.id;
                  const isCompleted = completedLessons.includes(les.id);
                  return (
                    <Link
                      key={les.id}
                      to={`/lessons/${les.id}`}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border shrink-0 ${isActive ? 'border-indigo-300' : 'border-slate-300 bg-white'}`} />
                      )}
                      <span className="line-clamp-1">{les.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT PANE */}
      <div className="lg:col-span-3 space-y-6">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
          <span>{course.title}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>{currentSection.title}</span>
        </div>

        {/* Lesson Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {lesson.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                Lesson {lesson.order}
              </span>
              {isLessonCompleted && (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  Completed
                </span>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Core Markdown-style content */}
          <div className="text-slate-600 text-base leading-relaxed space-y-4 whitespace-pre-line font-medium">
            {lesson.content}
          </div>

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 animate-scale">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Action completion buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100">
            <div>
              {!isLessonCompleted ? (
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer transition shadow-md shadow-indigo-100 disabled:opacity-50 text-sm"
                >
                  {markingComplete ? 'Marking...' : 'Mark as Complete'}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-100">
                  <CheckCircle className="w-4 h-4" />
                  <span>Curriculum Completed</span>
                </div>
              )}
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
              {nextLesson ? (
                <Link
                  to={`/lessons/${nextLesson.id}`}
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2 px-4 rounded-xl hover:bg-slate-100 transition text-sm cursor-pointer"
                >
                  Next Lesson <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to={`/courses/${course.id}/quiz/generate`}
                  className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-indigo-700 transition text-sm cursor-pointer shadow-md shadow-indigo-100"
                >
                  Unlock AI Quiz <Sparkles className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
