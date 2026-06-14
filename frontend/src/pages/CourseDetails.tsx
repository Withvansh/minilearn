import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Course, CourseProgress } from '../types';
import { ArrowLeft, BookOpen, CheckCircle, ChevronDown, ChevronRight, Play, Sparkles, Award, Plus, X, Shield } from 'lucide-react';

export default function CourseDetails() {
  const { id: courseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = localStorage.getItem('selectedUserId') || '';

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [hasQuizzes, setHasQuizzes] = useState(false);

  // Completed lessons tracked locally for this specific user
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Instructor Mode states
  const [isAdmin, setIsAdmin] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [newLessonSectionId, setNewLessonSectionId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [addingLesson, setAddingLesson] = useState(false);
  const [error, setError] = useState('');

  const fetchCourseData = async () => {
    if (!courseId || !userId) return;
    try {
      // Fetch course structure
      const courseData = await api.getCourse(courseId);
      setCourse(courseData);

      // Expand first section by default on initial load if not already set
      if (courseData.sections && courseData.sections.length > 0 && Object.keys(expandedSections).length === 0) {
        setExpandedSections({ [courseData.sections[0].id]: true });
      }

      // Fetch progress details
      const progressData = await api.getProgress(courseId);
      setProgress(progressData);

      // Check enrollment state: in localStorage or progress > 0
      const enrolledStr = localStorage.getItem(`enrolled_courses_${userId}`);
      const enrolledList = enrolledStr ? JSON.parse(enrolledStr) : [];
      const isLocallyEnrolled = enrolledList.includes(courseId);
      const hasSomeProgress = progressData.completedLessons > 0;
      
      if (isLocallyEnrolled || hasSomeProgress) {
        setIsEnrolled(true);
        if (!isLocallyEnrolled) {
          // Sync local storage
          enrolledList.push(courseId);
          localStorage.setItem(`enrolled_courses_${userId}`, JSON.stringify(enrolledList));
        }
      }

      // Check if there are generated quizzes in database
      try {
        const quizList = await api.getQuiz(courseId);
        setHasQuizzes(quizList && quizList.length > 0);
      } catch {
        setHasQuizzes(false);
      }

      // Load completed lessons list for checkmarks
      const compStr = localStorage.getItem(`completed_lessons_${userId}`);
      setCompletedLessons(compStr ? JSON.parse(compStr) : []);

    } catch (err) {
      console.error('Error loading course details:', err);
    }
  };

  useEffect(() => {
    const mode = localStorage.getItem('userMode') || 'learner';
    setIsAdmin(mode === 'instructor');

    const loadInitial = async () => {
      setLoading(true);
      await fetchCourseData();
      setLoading(false);
    };
    loadInitial();
  }, [courseId, userId]);

  const handleEnroll = async () => {
    if (!courseId || !userId) return;
    try {
      await api.enroll(courseId);
      setIsEnrolled(true);

      // Save enrollment to local storage registry
      const enrolledStr = localStorage.getItem(`enrolled_courses_${userId}`);
      const enrolledList = enrolledStr ? JSON.parse(enrolledStr) : [];
      if (!enrolledList.includes(courseId)) {
        enrolledList.push(courseId);
        localStorage.setItem(`enrolled_courses_${userId}`, JSON.stringify(enrolledList));
      }

      // Re-fetch progress to initialize
      const progressData = await api.getProgress(courseId);
      setProgress(progressData);
    } catch (err) {
      console.error('Enrollment failed:', err);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !sectionTitle.trim()) return;

    setAddingSection(true);
    setError('');

    try {
      const nextOrder = (course?.sections?.length || 0) + 1;
      await api.createSection(courseId, sectionTitle.trim(), nextOrder);
      setSectionTitle('');
      await fetchCourseData();
    } catch (err: any) {
      console.error('Failed to create section:', err);
      setError(err.response?.data?.error || 'Failed to create section. Please try again.');
    } finally {
      setAddingSection(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent, sectionId: string) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    setAddingLesson(true);
    setError('');

    try {
      const section = course?.sections?.find((s) => s.id === sectionId);
      const nextOrder = (section?.lessons?.length || 0) + 1;
      await api.createLesson(sectionId, lessonTitle.trim(), lessonContent.trim(), nextOrder);
      setLessonTitle('');
      setLessonContent('');
      setNewLessonSectionId(null);
      await fetchCourseData();
      // Keep this section expanded to see the new lesson
      setExpandedSections((prev) => ({ ...prev, [sectionId]: true }));
    } catch (err: any) {
      console.error('Failed to create lesson:', err);
      setError(err.response?.data?.error || 'Failed to create lesson. Please try again.');
    } finally {
      setAddingLesson(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 flex-col gap-3">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-semibold">Loading course details...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Course Not Found</h2>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to courses
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-semibold animate-fade-in flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-600 p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Overview, Progress & Quiz */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Course Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight font-heading">
              {course.title}
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Instructor Mode Card vs. Enrollment Card */}
          {isAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
              <div className="h-12 w-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-amber-900 font-heading">Instructor Console</h3>
                <p className="text-xs text-amber-700 leading-relaxed">
                  You are editing this course's curriculum. Add sections and lessons directly in the panel on the right.
                </p>
              </div>
              <div className="p-3.5 bg-white border border-amber-200 rounded-xl space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Sections Count:</span>
                  <span className="text-slate-950 font-bold">{course.sections?.length || 0}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span>Lessons Count:</span>
                  <span className="text-slate-950 font-bold">
                    {course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              {!isEnrolled ? (
                <div className="text-center py-4 space-y-4">
                  <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-8 h-8 fill-indigo-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900">Start learning today</h3>
                    <p className="text-xs text-slate-400">Enroll to track your progress and complete generated AI quizzes.</p>
                  </div>
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
                  >
                    Enroll in Course
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900">Your Progress</h3>
                  {progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>{progress.completedLessons} of {progress.totalLessons} Lessons</span>
                        <span>{progress.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <hr className="border-slate-100" />

                  {/* AI Quiz Panel */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
                      <Sparkles className="w-4 h-4 fill-indigo-100" />
                      <span>AI Learning Quiz</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Test your understanding with micro-quizzes dynamically generated from lessons.
                    </p>

                    <div className="flex flex-col gap-2">
                      {hasQuizzes && (
                        <button
                          onClick={() => navigate(`/courses/${courseId}/quiz/attempt`)}
                          className="w-full inline-flex justify-center items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-indigo-100 transition text-sm"
                        >
                          <Award className="w-4 h-4" /> Take Current Quiz
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/courses/${courseId}/quiz/generate`)}
                        className="w-full inline-flex justify-center items-center gap-1.5 bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-indigo-700 transition text-sm shadow-sm"
                      >
                        <Sparkles className="w-4 h-4" /> Generate AI Quiz
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Syllabus Sections List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-slate-900 font-heading">Syllabus Curriculum</h2>
            
            {course.sections && course.sections.length > 0 ? (
              <div className="space-y-3">
                {course.sections.map((sec) => {
                  const isExpanded = expandedSections[sec.id];
                  return (
                    <div key={sec.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-xs bg-white">
                      {/* Section Title Header bar */}
                      <button
                        onClick={() => toggleSection(sec.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">
                            Section {sec.order}
                          </span>
                          <span className="font-bold text-slate-800">{sec.title}</span>
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {/* Lessons under Section */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-100 bg-white border-t border-slate-100">
                          {sec.lessons && sec.lessons.length > 0 ? (
                            sec.lessons.map((lesson) => {
                              const isCompleted = completedLessons.includes(lesson.id);
                              return (
                                <div
                                  key={lesson.id}
                                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
                                >
                                  <div className="flex items-center gap-3">
                                    {isCompleted ? (
                                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border border-slate-200 shrink-0 bg-white" />
                                    )}
                                    <span className="text-sm font-semibold text-slate-700">
                                      {lesson.title}
                                    </span>
                                  </div>

                                  <div>
                                    {isAdmin ? (
                                      <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-md">
                                        Editable
                                      </span>
                                    ) : isEnrolled ? (
                                      <Link
                                        to={`/lessons/${lesson.id}`}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                                      >
                                        Start <Play className="w-3 h-3 fill-indigo-600" />
                                      </Link>
                                    ) : (
                                      <button
                                        onClick={handleEnroll}
                                        className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition"
                                      >
                                        Enroll to start
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-400">
                              No lessons created in this section yet.
                            </div>
                          )}

                          {/* Add Lesson Form Inline (Only for Instructor) */}
                          {isAdmin && (
                            <div className="p-4 bg-slate-50/50">
                              {newLessonSectionId === sec.id ? (
                                <form onSubmit={(e) => handleAddLesson(e, sec.id)} className="space-y-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                      Lesson Title
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. Variables & Scopes"
                                      value={lessonTitle}
                                      onChange={(e) => setLessonTitle(e.target.value)}
                                      className="w-full bg-white border border-slate-200 text-slate-900 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                      Lesson Content text
                                    </label>
                                    <textarea
                                      required
                                      placeholder="Write plain text body content..."
                                      rows={3}
                                      value={lessonContent}
                                      onChange={(e) => setLessonContent(e.target.value)}
                                      className="w-full bg-white border border-slate-200 text-slate-900 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold transition"
                                    />
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setNewLessonSectionId(null)}
                                      className="px-3 py-1 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-white cursor-pointer transition"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      disabled={addingLesson}
                                      className="px-3.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:bg-indigo-400 cursor-pointer transition shadow-sm"
                                    >
                                      {addingLesson ? 'Adding...' : 'Add Lesson'}
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewLessonSectionId(sec.id);
                                    setLessonTitle('');
                                    setLessonContent('');
                                  }}
                                  className="w-full py-2 border border-dashed border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 font-semibold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer bg-white hover:bg-slate-50 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add Lesson
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                No syllabus sections added to this course.
              </div>
            )}

            {/* Add Section Form (Only for Instructor) */}
            {isAdmin && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3 font-heading flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span>Add New Section</span>
                </h3>
                <form onSubmit={handleAddSection} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter section title..."
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-semibold transition"
                  />
                  <button
                    type="submit"
                    disabled={addingSection}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer text-sm transition shadow-sm"
                  >
                    {addingSection ? 'Adding...' : 'Add Section'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
