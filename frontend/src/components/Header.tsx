import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, UserResponse } from '../services/api';
import { BookOpen, LogOut, GraduationCap, Shield } from 'lucide-react';

export default function Header() {
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [mode, setMode] = useState<string>('learner');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = localStorage.getItem('selectedUserId');
        const storedMode = localStorage.getItem('userMode') || 'learner';
        setMode(storedMode);

        if (storedUserId) {
          const usersList = await api.getUsers();
          const match = usersList.find((u) => u.id === storedUserId);
          if (match) {
            setCurrentUser(match);
          }
        }
      } catch (err) {
        console.error('Error in Header user fetch:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('selectedUserId');
    localStorage.removeItem('userMode');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-indigo-600 font-extrabold text-xl font-heading">
          <BookOpen className="w-6 h-6 animate-pulse" />
          <span>MiniLearn</span>
        </Link>

        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl py-1.5 px-3">
              {/* User Avatar Initials */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-inner ${
                mode === 'instructor' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {currentUser.username[0].toUpperCase()}
              </div>
              
              {/* Profile details */}
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-bold text-slate-800">{currentUser.username}</span>
                <span className="text-[9px] text-slate-400 font-semibold">{currentUser.email}</span>
              </div>

              {/* Mode Badge */}
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                mode === 'instructor' 
                  ? 'bg-amber-100/80 text-amber-700 border border-amber-200 shadow-3xs' 
                  : 'bg-indigo-100/80 text-indigo-700 border border-indigo-200 shadow-3xs'
              }`}>
                {mode === 'instructor' ? (
                  <>
                    <Shield className="w-3 h-3 shrink-0" />
                    <span>Instructor</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3 h-3 shrink-0" />
                    <span>Learner</span>
                  </>
                )}
              </span>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
