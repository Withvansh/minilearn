import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { QuizQuestion } from '../types';
import { ArrowLeft, CheckCircle, XCircle, Sparkles, HelpCircle } from 'lucide-react';

export default function QuizAttempt() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Interactive answer state
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);

  // Score tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!courseId) return;

    const fetchQuizData = async () => {
      try {
        const quizList = await api.getQuiz(courseId);
        setQuestions(quizList);
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizData();
  }, [courseId]);

  const handleSubmitAnswer = async () => {
    if (!courseId || selectedIdx === null || isSubmitted) return;
    const currentQuestion = questions[currentIndex];

    try {
      const res = await api.attemptQuiz(courseId, currentQuestion.id, selectedIdx);
      setIsCorrect(res.isCorrect);
      setCorrectOptionIdx(res.correctOptionIdx);
      setIsSubmitted(true);

      // Record selection
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: selectedIdx
      }));

      if (res.isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Quiz attempt submission failed:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedIdx(null);
      setIsSubmitted(false);
      setCorrectOptionIdx(null);
    } else {
      // Go to results page, passing states
      navigate(`/courses/${courseId}/quiz/result`, {
        state: {
          correctCount,
          totalCount: questions.length,
          questions,
          userAnswers
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 flex-col gap-3">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-semibold">Preparing quiz challenge...</span>
      </div>
    );
  }

  // Handle empty state
  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 animate-fade-in">
        <HelpCircle className="w-16 h-16 text-slate-300 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">No Quiz Found</h2>
          <p className="text-sm text-slate-400">
            There are no generated quiz questions for this course yet.
          </p>
        </div>
        <Link
          to={`/courses/${courseId}/quiz/generate`}
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition text-sm shadow-sm"
        >
          <Sparkles className="w-4 h-4 fill-white" /> Generate AI Quiz
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercentage = Math.round(((currentIndex) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header / progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{progressPercentage}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Main quiz card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
          {currentQuestion.question_text}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isThisCorrect = correctOptionIdx === idx;
            const isThisWrong = isSelected && !isCorrect;

            let borderClass = 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300';
            let bgIndicator = 'bg-slate-200 text-slate-600';
            
            if (isSelected && !isSubmitted) {
              borderClass = 'border-indigo-600 bg-indigo-50/50';
              bgIndicator = 'bg-indigo-600 text-white';
            } else if (isSubmitted) {
              if (isThisCorrect) {
                borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                bgIndicator = 'bg-emerald-500 text-white';
              } else if (isThisWrong) {
                borderClass = 'border-rose-500 bg-rose-50 text-rose-950';
                bgIndicator = 'bg-rose-500 text-white';
              } else {
                borderClass = 'border-slate-100 opacity-60';
                bgIndicator = 'bg-slate-200 text-slate-400';
              }
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedIdx(idx)}
                className={`w-full flex items-center gap-3 p-4 border rounded-xl text-left text-xs sm:text-sm font-semibold transition cursor-pointer ${borderClass}`}
              >
                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold shrink-0 ${bgIndicator}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>

                {isSubmitted && isThisCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                {isSubmitted && isThisWrong && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action controls */}
        <div className="pt-4 flex justify-between items-center border-t border-slate-100">
          <Link
            to={`/courses/${courseId}`}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Quit quiz
          </Link>

          <div>
            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedIdx === null}
                className="bg-indigo-600 text-white font-extrabold py-2 px-6 rounded-xl hover:bg-indigo-700 transition text-sm cursor-pointer shadow-sm disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-indigo-600 text-white font-extrabold py-2 px-6 rounded-xl hover:bg-indigo-700 transition text-sm cursor-pointer shadow-sm"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
