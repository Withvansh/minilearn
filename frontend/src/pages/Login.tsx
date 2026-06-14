import { useEffect, useState } from 'react';
import { api, UserResponse } from '../services/api';
import { GraduationCap, Shield, Sparkles, User, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';

const GOOGLE_CLIENT_ID = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'signin' | 'accounts' | 'role'>('signin');
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [selectedRole, setSelectedRole] = useState<'learner' | 'instructor' | null>(null);
  const [error, setError] = useState('');
  const [hasClientId, setHasClientId] = useState(false);

  useEffect(() => {
    // Check if Client ID is configured
    setHasClientId(!!GOOGLE_CLIENT_ID);

    // Fetch registered users as fallback / developer sandbox mode
    const fetchUsersList = async () => {
      try {
        const list = await api.getUsers();
        setUsers(list);
      } catch (err) {
        console.error('Error fetching users for sign in:', err);
        setError('Failed to contact server. Please verify the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsersList();
  }, []);

  // Initialize GSI if Client ID is set
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initializeGoogleGSI = () => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        g.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        g.accounts.id.renderButton(
          document.getElementById('googleSignInBtn'),
          { theme: 'outline', size: 'large', width: 340 }
        );
      }
    };

    const interval = setInterval(() => {
      const g = (window as any).google;
      if (g?.accounts?.id) {
        initializeGoogleGSI();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [hasClientId]);

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError('');
    try {
      const idToken = response.credential;
      const loggedInUser = await api.loginWithGoogle(idToken);
      setSelectedUser(loggedInUser);
      setStep('role');
    } catch (err: any) {
      console.error('Google OAuth backend verify error:', err);
      setError(err.response?.data?.error || 'Authentication with backend failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInClickFallback = () => {
    if (users.length === 0) {
      setError('No users available to login. Is the backend running?');
      return;
    }
    setStep('accounts');
  };

  const handleAccountSelect = (user: UserResponse) => {
    setSelectedUser(user);
    setStep('role');
  };

  const handleRoleSelect = (role: 'learner' | 'instructor') => {
    setSelectedRole(role);
  };

  const handleFinalizeLogin = () => {
    if (!selectedUser || !selectedRole) return;

    localStorage.setItem('selectedUserId', selectedUser.id);
    localStorage.setItem('userMode', selectedRole);
    
    // Redirect to home dashboard
    window.location.href = '/';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Decorative subtle background gradients */}
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-indigo-50 blur-3xl opacity-60"></div>
        <div className="absolute -left-24 -bottom-24 w-48 h-48 rounded-full bg-amber-50 blur-3xl opacity-60"></div>

        {/* Step 1: Landing Google Sign-in */}
        {step === 'signin' && (
          <div className="space-y-8 relative z-10 text-center">
            <div className="space-y-3">
              <div className="mx-auto h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <GraduationCap className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-heading">Welcome to MiniLearn</h2>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                Discover bite-sized micro-courses, test your skills with smart AI quizzes, and master new fields.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {hasClientId ? (
                /* Real Google Sign In button Container */
                <div className="flex flex-col items-center justify-center gap-4 py-2">
                  <div id="googleSignInBtn" className="min-h-[40px] flex justify-center"></div>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 fill-emerald-100" />
                    <span>Real Google Sign-In SDK Active</span>
                  </div>
                </div>
              ) : (
                /* Fallback Simulated Sign In button */
                <div className="space-y-4">
                  <button
                    onClick={handleGoogleSignInClickFallback}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold py-3 px-4 rounded-xl shadow-xs transition duration-200 cursor-pointer disabled:opacity-50"
                  >
                    {/* SVG Google G logo */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.55 0 2.96.57 4.05 1.51l3.1-3.1C19.16 2.03 15.93 1 12.24 1 5.76 1 .5 6.26.5 12.74S5.76 24.48 12.24 24.48c6.12 0 11.23-4.34 11.23-11.23 0-.74-.08-1.48-.23-2.2H12.24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M3.24 7.625l3.87 2.87c.97-2.31 3.24-3.9 5.89-3.9 1.55 0 2.96.57 4.05 1.51l3.1-3.1C18.29 3.23 15.42 2 12 2c-4.14 0-7.78 2.29-9.76 5.625z"
                      />
                      <path
                        fill="#4285F4"
                        d="M12.24 22c3.43 0 6.31-1.13 8.41-3.09l-3.32-2.73c-1.32.89-3.03 1.42-5.09 1.42-2.65 0-4.92-1.59-5.89-3.9l-3.87 2.87C4.46 19.71 8.1 22 12.24 22z"
                      />
                      <path
                        fill="#34A853"
                        d="M6.35 13.8c-.22-.67-.35-1.38-.35-2.12s.13-1.45.35-2.12L2.48 6.69C1.67 8.35 1.2 10.12 1.2 12s.47 3.65 1.28 5.31l3.87-3.51z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>

                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-left space-y-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Developer Sandbox Mode</span>
                    </div>
                    <p className="text-[10px] text-amber-700 leading-normal">
                      `VITE_GOOGLE_CLIENT_ID` is not set in `.env`. Launching with simulated accounts for testing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Google Account Chooser Modal */}
        {step === 'accounts' && (
          <div className="space-y-6 relative z-10">
            <div className="text-center space-y-2">
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 1.56-1.56 2.95-3.24 3.75v3.08h5.27c3.09-2.85 4.87-7.05 4.87-12.06 0-.68-.07-1.35-.24-2zM12.18 21.43c2.7 0 4.97-.9 6.62-2.43l-5.27-3.08c-1.46.98-3.32 1.56-5.43 1.56-4.18 0-7.72-2.83-8.98-6.64H3.85v3.18C6.39 19.14 9.09 21.43 12.18 21.43zM3.2 10.84a11.96 11.96 0 0 1 0-4.24V3.42H.91a11.97 11.97 0 0 0 0 10.6l2.29-3.18zM12.18 5.43c2.25 0 4.02.78 5.61 2.29l4.2-4.2C19.45 1.13 16.1 0 12.18 0 9.09 0 6.39 2.29 3.85 5.42L7.2 8.6c1.26-3.81 4.8-6.64 8.98-6.64z"
                />
              </svg>
              <h3 className="text-xl font-bold text-slate-900 font-heading">Choose an account</h3>
              <p className="text-xs text-slate-400">to continue to MiniLearn</p>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl bg-slate-50/50">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleAccountSelect(u)}
                  className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-sm">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{u.username}</h4>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <User className="w-3.5 h-3.5 text-slate-300" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('signin')}
              className="w-full flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer transition block py-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          </div>
        )}

        {/* Step 3: Choose Role Selector Mode */}
        {step === 'role' && (
          <div className="space-y-6 relative z-10 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                Signed in as {selectedUser?.username}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">Choose your role</h3>
              <p className="text-xs text-slate-400">Configure your workspace view preference</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Learner Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('learner')}
                className={`p-5 rounded-2xl border text-center space-y-3 transition flex flex-col items-center cursor-pointer ${
                  selectedRole === 'learner'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition ${
                  selectedRole === 'learner' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-800">Learner</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">Study, track progress, test skills</p>
                </div>
              </button>

              {/* Instructor Card */}
              <button
                type="button"
                onClick={() => handleRoleSelect('instructor')}
                className={`p-5 rounded-2xl border text-center space-y-3 transition flex flex-col items-center cursor-pointer ${
                  selectedRole === 'instructor'
                    ? 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition ${
                  selectedRole === 'instructor' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-slate-800">Instructor</h4>
                  <p className="text-[10px] text-slate-400 leading-snug">Create courses, manage lessons</p>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinalizeLogin}
                disabled={!selectedRole}
                className="w-full inline-flex justify-center items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition shadow-md shadow-indigo-100 text-sm"
              >
                <span>Launch MiniLearn</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedRole(null);
                setStep(hasClientId ? 'signin' : 'accounts');
              }}
              className="w-full flex items-center justify-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer transition block py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
