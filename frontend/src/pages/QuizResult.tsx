import { useLocation, useParams, Link } from 'react-router-dom';
import { QuizQuestion } from '../types';
import { ArrowLeft, Sparkles, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

interface ResultState {
  correctCount: number;
  totalCount: number;
  questions: QuizQuestion[];
  userAnswers: Record<string, number>;
}

export default function QuizResult() {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();

  const state = location.state as ResultState | null;

  if (!state || !courseId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6 animate-fade-in">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">No Results Found</h2>
          <p className="text-sm text-slate-400">
            Please attempt a quiz before visiting the result page.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition text-sm shadow-sm"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const { correctCount, totalCount, questions, userAnswers } = state;
  const scorePercentage = Math.round((correctCount / totalCount) * 100);

  // Performance feedbacks
  let feedbackTitle = '';
  let feedbackMessage = '';
  let feedbackBg = '';

  if (scorePercentage === 100) {
    feedbackTitle = '🌟 Perfect Score!';
    feedbackMessage = 'Excellent job! You have fully mastered this curriculum material.';
    feedbackBg = 'bg-gradient-to-r from-amber-500 to-amber-600';
  } else if (scorePercentage >= 80) {
    feedbackTitle = '🎉 Great Work!';
    feedbackMessage = 'Impressive work! You have a strong grasp of these concepts.';
    feedbackBg = 'bg-gradient-to-r from-emerald-500 to-emerald-600';
  } else if (scorePercentage >= 50) {
    feedbackTitle = '👍 Good Effort!';
    feedbackMessage = 'Nice try. Review your mistakes below to achieve a perfect score next time.';
    feedbackBg = 'bg-gradient-to-r from-indigo-500 to-indigo-600';
  } else {
    feedbackTitle = '📚 Keep Learning';
    feedbackMessage = 'Review the lesson pages and try creating a fresh AI quiz to test yourself again.';
    feedbackBg = 'bg-gradient-to-r from-slate-500 to-slate-600';
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      
      {/* Score overview header */}
      <div className={`${feedbackBg} text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-4 relative overflow-hidden`}>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-6 translate-y-6">
          <Sparkles className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {feedbackTitle}
            </h1>
            <p className="text-indigo-100 text-sm max-w-md font-semibold leading-relaxed">
              {feedbackMessage}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 text-center border border-white/20 min-w-36 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block mb-1">
              Final Score
            </span>
            <span className="text-4xl sm:text-5xl font-black block">
              {scorePercentage}%
            </span>
            <span className="text-xs font-semibold text-white/95 mt-1 block">
              {correctCount} / {totalCount} Correct
            </span>
          </div>
        </div>
      </div>

      {/* Course Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link
          to={`/courses/${courseId}/quiz/generate`}
          className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition text-sm cursor-pointer shadow-md shadow-indigo-100"
        >
          <RefreshCw className="w-4 h-4" /> Try Another Quiz
        </Link>
        <Link
          to={`/courses/${courseId}`}
          className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 bg-white text-slate-700 border border-slate-200 font-bold py-2.5 px-6 rounded-xl hover:bg-slate-50 transition text-sm cursor-pointer"
        >
          <BookOpen className="w-4 h-4" /> Review Syllabus
        </Link>
        <Link
          to="/"
          className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 bg-white text-slate-400 font-semibold py-2.5 px-6 rounded-xl hover:text-slate-600 transition text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Other Courses
        </Link>
      </div>

      {/* Review details */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900">
          Review Answers
        </h2>
        <hr className="border-slate-100" />

        <div className="space-y-6 divide-y divide-slate-100">
          {questions.map((q, idx) => {
            const userSelection = userAnswers[q.id];
            const isUserCorrect = userSelection === q.correct_option_idx;

            return (
              <div key={q.id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} space-y-4`}>
                <div className="flex gap-2 items-start">
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 py-0.5 px-2 rounded-md shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                    {q.question_text}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectAnswer = optIdx === q.correct_option_idx;
                    const isUserSelection = optIdx === userSelection;

                    let optionBorder = 'border-slate-100 bg-slate-50/50';
                    let labelBg = 'bg-slate-200 text-slate-500';

                    if (isCorrectAnswer) {
                      optionBorder = 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold';
                      labelBg = 'bg-emerald-500 text-white';
                    } else if (isUserSelection && !isUserCorrect) {
                      optionBorder = 'border-rose-500 bg-rose-50/50 text-rose-900';
                      labelBg = 'bg-rose-500 text-white';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2.5 p-3 border rounded-xl text-xs sm:text-sm ${optionBorder}`}
                      >
                        <span className={`w-5 h-5 flex items-center justify-center rounded-md text-[10px] font-black shrink-0 ${labelBg}`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
