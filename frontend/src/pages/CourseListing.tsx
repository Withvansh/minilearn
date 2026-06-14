import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Course } from '../types';
import { Search, BookOpen, ChevronRight, Compass, Plus, X } from 'lucide-react';

export default function CourseListing() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  // Instructor Mode states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const list = await api.getCourses();
        setCourses(list);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    const mode = localStorage.getItem('userMode') || 'learner';
    setIsAdmin(mode === 'instructor');

    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) {
      setError('Course title is required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const created = await api.createCourse(newCourseTitle.trim(), newCourseDesc.trim());
      // Prepend to courses list so it's shown immediately
      setCourses((prev) => [created, ...prev]);
      setNewCourseTitle('');
      setNewCourseDesc('');
      setShowCreateForm(false);
    } catch (err: any) {
      console.error('Failed to create course:', err);
      setError(err.response?.data?.error || 'Failed to create course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', 'Programming', 'Databases', 'Finance'];

  const getCourseCategory = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes('javascript') || t.includes('python') || t.includes('code') || t.includes('react')) return 'Programming';
    if (t.includes('database') || t.includes('sql') || t.includes('query')) return 'Databases';
    if (t.includes('finance') || t.includes('budget') || t.includes('invest')) return 'Finance';
    return 'Other';
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    
    if (activeCategory === 'All') return matchesSearch;
    return matchesSearch && getCourseCategory(c.title) === activeCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 flex-col gap-3">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-semibold">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-indigo-600 rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg shadow-indigo-100">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          <Compass className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Learn something new, one bite at a time.
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Welcome to MiniLearn, where you can explore bite-sized courses on programming, database query languages, and personal wealth creation. Test your skills instantly with generated AI quizzes.
          </p>
        </div>
      </div>

      {/* Instructor Console Banner */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm animate-fade-in">
          <div>
            <h2 className="text-lg font-bold text-amber-900 font-heading">Instructor Management</h2>
            <p className="text-sm text-amber-700">You are acting as an Instructor. You have full edit access to manage MiniLearn courses.</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="sm:self-center inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-2.5 px-5 rounded-xl cursor-pointer transition shadow-md shadow-amber-100 shrink-0"
          >
            <Plus className="w-4.5 h-4.5" /> Create Course Card
          </button>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs sm:text-sm font-semibold py-1.5 px-4 rounded-lg cursor-pointer whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                    {getCourseCategory(c.title)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 font-heading">
                  {c.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/courses/${c.id}`}
                  className="w-full inline-flex justify-center items-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm py-2 px-4 rounded-lg cursor-pointer hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-600 transition"
                >
                  Explore Course <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center space-y-4">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Courses Found</h3>
            <p className="text-slate-400 text-sm">
              We couldn't find any courses matching your search parameters.
            </p>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-6 animate-scale-in">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setError('');
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 font-heading">Create New Course</h3>
              <p className="text-xs text-slate-400">Fill in the details below to initialize a new course card.</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to React"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Description</label>
                <textarea
                  placeholder="Describe what students will learn in this course..."
                  rows={4}
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl cursor-pointer hover:bg-slate-50 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700 disabled:bg-indigo-400 text-sm transition shadow-md shadow-indigo-100"
                >
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
