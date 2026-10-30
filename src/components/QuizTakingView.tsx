import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Eye,
  X,
  Send,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Question, QuizConfig, UserAnswer, QuizResult } from '../types/quiz';

interface QuizTakingViewProps {
  quiz: {
    title: string;
    questions: Question[];
    config: QuizConfig;
  };
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export const QuizTakingView: React.FC<QuizTakingViewProps> = ({ quiz, onComplete, onExit }) => {
  const { title, questions, config } = quiz;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [startTime] = useState<number>(Date.now());
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(
    config.timeLimitMinutes > 0 ? config.timeLimitMinutes * 60 : 0
  );

  // Practice mode revealed explanations for current question
  const [revealedInPractice, setRevealedInPractice] = useState<Record<string, boolean>>({});

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigationDrawer, setShowNavigationDrawer] = useState(false);

  // Initialize question timing
  useEffect(() => {
    const qId = questions[currentIndex]?.id;
    if (qId && !questionStartTimes[qId]) {
      setQuestionStartTimes((prev) => ({ ...prev, [qId]: Date.now() }));
    }
  }, [currentIndex, questions, questionStartTimes]);

  // Timer countdown
  useEffect(() => {
    if (config.mode !== 'exam' || config.timeLimitMinutes <= 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on timeout
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.mode, config.timeLimitMinutes]);

  const currentQ = questions[currentIndex];
  const currentAnswer = userAnswers[currentQ?.id] || {
    questionId: currentQ?.id || '',
    selectedOptions: [],
    textAnswer: '',
    isMarkedForReview: false,
    timeSpentSeconds: 0
  };

  // Option selection
  const handleSelectOption = (option: string) => {
    const qId = currentQ.id;

    if (currentQ.type === 'multi_select') {
      const existing = currentAnswer.selectedOptions || [];
      const updated = existing.includes(option)
        ? existing.filter((item) => item !== option)
        : [...existing, option];

      setUserAnswers((prev) => ({
        ...prev,
        [qId]: {
          ...currentAnswer,
          questionId: qId,
          selectedOptions: updated
        }
      }));
    } else {
      // Single selection: mcq, true_false, or fill_blank
      setUserAnswers((prev) => ({
        ...prev,
        [qId]: {
          ...currentAnswer,
          questionId: qId,
          selectedOptions: [option],
          textAnswer: option
        }
      }));
    }
  };

  // Fill in the blanks text input
  const handleTextAnswerChange = (val: string) => {
    const qId = currentQ.id;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...currentAnswer,
        questionId: qId,
        selectedOptions: val.trim() ? [val.trim()] : [],
        textAnswer: val
      }
    }));
  };

  // Toggle review flag
  const handleToggleReview = () => {
    const qId = currentQ.id;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...currentAnswer,
        questionId: qId,
        isMarkedForReview: !currentAnswer.isMarkedForReview
      }
    }));
  };

  // Navigation
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  // Calculate score and build result
  const handleFinalSubmit = useCallback(() => {
    const totalTimeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const topicBreakdown: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q) => {
      const topic = q.topic || 'General';
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { total: 0, correct: 0 };
      }
      topicBreakdown[topic].total += 1;

      const ans = userAnswers[q.id];
      const hasAnswered =
        (ans?.selectedOptions && ans.selectedOptions.length > 0) ||
        (ans?.textAnswer && ans.textAnswer.trim().length > 0);

      if (!hasAnswered) {
        unansweredCount += 1;
        return;
      }

      let isCorrect = false;

      if (q.type === 'multi_select') {
        // Multi-select: user selected options must match exact correctAnswers set
        const userSet = new Set(ans.selectedOptions.map((s) => s.trim().toLowerCase()));
        const correctSet = new Set(q.correctAnswers.map((s) => s.trim().toLowerCase()));
        if (userSet.size === correctSet.size && [...userSet].every((item) => correctSet.has(item))) {
          isCorrect = true;
        }
      } else if (q.type === 'fill_blank') {
        const userVal = (ans.textAnswer || ans.selectedOptions[0] || '').trim().toLowerCase();
        isCorrect = q.correctAnswers.some((c) => c.trim().toLowerCase() === userVal);
      } else {
        // mcq or true_false
        const userSelected = (ans.selectedOptions[0] || '').trim().toLowerCase();
        isCorrect = q.correctAnswers.some((c) => c.trim().toLowerCase() === userSelected);
      }

      if (isCorrect) {
        correctCount += 1;
        topicBreakdown[topic].correct += 1;
      } else {
        incorrectCount += 1;
      }
    });

    const maxScore = questions.length;
    const rawScore = correctCount;
    // Negative marking: -0.25 per wrong answer
    const penalty = config.negativeMarking ? incorrectCount * 0.25 : 0;
    const netScore = Math.max(0, parseFloat((rawScore - penalty).toFixed(2)));
    const percentage = Math.round((netScore / maxScore) * 100);

    const result: QuizResult = {
      quizId: `result-${Date.now()}`,
      title,
      mode: config.mode,
      totalQuestions: questions.length,
      answeredCount: correctCount + incorrectCount,
      correctCount,
      incorrectCount,
      unansweredCount,
      rawScore,
      netScore,
      maxScore,
      percentage,
      negativeMarkingApplied: config.negativeMarking,
      timeSpentSeconds: totalTimeSpentSeconds,
      completedAt: new Date().toISOString(),
      answers: userAnswers,
      topicBreakdown
    };

    onComplete(result);
  }, [questions, userAnswers, startTime, config, title, onComplete]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
        handlePrev();
      } else if (e.key.toLowerCase() === 'r') {
        handleToggleReview();
      } else if (['1', '2', '3', '4'].includes(e.key) && currentQ.options.length > 0) {
        const optionIndex = parseInt(e.key, 10) - 1;
        if (currentQ.options[optionIndex]) {
          handleSelectOption(currentQ.options[optionIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, currentIndex, handleNext, handlePrev]);

  // Timer display formatting
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stats for submission confirmation
  const totalAnswered = questions.filter((q) => {
    const ans = userAnswers[q.id];
    return ans?.selectedOptions?.length > 0 || (ans?.textAnswer && ans.textAnswer.trim().length > 0);
  }).length;
  const totalMarked = questions.filter((q) => userAnswers[q.id]?.isMarkedForReview).length;
  const totalUnanswered = questions.length - totalAnswered;

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Exit Quiz"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="truncate max-w-[200px] sm:max-w-md">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">{title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="capitalize">{config.mode} Mode</span>
                <span>•</span>
                <span>Question {currentIndex + 1} of {questions.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer for exam mode */}
            {config.mode === 'exam' && config.timeLimitMinutes > 0 && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                  timeRemainingSeconds < 120
                    ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{formatTimer(timeRemainingSeconds)}</span>
              </div>
            )}

            {/* Questions Drawer Toggle */}
            <button
              onClick={() => setShowNavigationDrawer(!showNavigationDrawer)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Questions</span>
              <span>({totalAnswered}/{questions.length})</span>
            </button>

            {/* Submit Quiz CTA */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Quiz Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Question Header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                Question {currentIndex + 1}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                {currentQ.type === 'mcq'
                  ? 'Single Choice'
                  : currentQ.type === 'multi_select'
                  ? 'Multiple Select'
                  : currentQ.type === 'true_false'
                  ? 'True / False'
                  : 'Fill in the Blank'}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${
                  currentQ.difficulty === 'easy'
                    ? 'bg-emerald-50 text-emerald-700'
                    : currentQ.difficulty === 'hard'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {currentQ.difficulty}
              </span>
              {currentQ.topic && (
                <span className="text-xs text-slate-600 truncate max-w-[200px] hidden sm:inline">
                  • {currentQ.topic}
                </span>
              )}
            </div>

            {/* Mark for review toggle */}
            <button
              onClick={handleToggleReview}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                currentAnswer.isMarkedForReview
                  ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Flag
                className={`w-3.5 h-3.5 ${
                  currentAnswer.isMarkedForReview
                    ? 'text-amber-600 fill-amber-600'
                    : 'text-slate-400'
                }`}
              />
              <span>{currentAnswer.isMarkedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question Prompt Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQ.question}
            </h2>

            {currentQ.sourceReference && (
              <p className="mt-3 text-xs text-slate-600 italic">
                Source Citation: {currentQ.sourceReference}
              </p>
            )}

            {currentQ.type === 'multi_select' && (
              <p className="mt-2 text-xs font-medium text-indigo-600">
                (Select all correct statements that apply)
              </p>
            )}

            {/* Answer Options */}
            <div className="mt-6 space-y-3">
              {currentQ.type === 'fill_blank' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Type your answer for the blank:
                    </label>
                    <input
                      type="text"
                      value={currentAnswer.textAnswer || ''}
                      onChange={(e) => handleTextAnswerChange(e.target.value)}
                      placeholder="Enter the missing term..."
                      className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium text-slate-900"
                    />
                  </div>

                  {currentQ.options && currentQ.options.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-slate-500 block mb-2">
                        Or select from these options:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentQ.options.map((opt, idx) => {
                          const isSelected =
                            (currentAnswer.textAnswer || '').trim().toLowerCase() ===
                            opt.trim().toLowerCase();
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectOption(opt)}
                              className={`p-3 text-left text-xs sm:text-sm font-medium rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = currentAnswer.selectedOptions?.includes(option);
                    const letterTag = String.fromCharCode(65 + idx);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(option)}
                        className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-xs'
                            : 'border-slate-200/90 hover:border-indigo-200 hover:bg-slate-50/70 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {currentQ.type === 'multi_select'
                              ? isSelected
                                ? '✓'
                                : ''
                              : letterTag}
                          </span>
                          <span className="leading-snug">{option}</span>
                        </div>

                        <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
                          [{idx + 1}]
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Practice Mode Instant Explanation */}
            {config.mode === 'practice' && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                {!revealedInPractice[currentQ.id] ? (
                  <button
                    type="button"
                    onClick={() =>
                      setRevealedInPractice((prev) => ({ ...prev, [currentQ.id]: true }))
                    }
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Check Answer & View Explanation</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 animate-in fade-in space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Explanation
                      </div>
                      <span className="text-xs font-bold text-emerald-700">
                        Correct: {currentQ.correctAnswers.join(', ')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation Toolbar */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-slate-400 hidden sm:block">
            Keyboard shortcuts: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border">1-4</kbd> options, <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border">N</kbd> next, <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border">R</kbd> review
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <span>{currentIndex === questions.length - 1 ? 'Finish & Review' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Slide-out Question Navigation Palette */}
      {showNavigationDrawer && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-80 bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Question Navigator</h3>
                <button
                  onClick={() => setShowNavigationDrawer(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-indigo-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-400" />
                  <span>Marked Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-slate-300 bg-white" />
                  <span>Unanswered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border-2 border-indigo-600" />
                  <span>Current</span>
                </div>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const isAnswered =
                    ans?.selectedOptions?.length > 0 || (ans?.textAnswer && ans.textAnswer.trim().length > 0);
                  const isMarked = ans?.isMarkedForReview;
                  const isCurrent = idx === currentIndex;

                  let style = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
                  if (isAnswered) {
                    style = 'bg-indigo-600 border-indigo-600 text-white font-bold';
                  }
                  if (isMarked) {
                    style = 'bg-amber-400 border-amber-400 text-slate-900 font-bold';
                  }
                  if (isCurrent) {
                    style += ' ring-2 ring-indigo-500 ring-offset-2';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setShowNavigationDrawer(false);
                      }}
                      className={`h-10 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all cursor-pointer ${style}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setShowNavigationDrawer(false);
                setShowSubmitModal(true);
              }}
              className="w-full mt-6 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              Submit Quiz Now
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Ready to Submit?</h3>
                <p className="text-xs text-slate-500">Review your completion status</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-center text-xs">
              <div>
                <span className="block font-extrabold text-indigo-600 text-lg">{totalAnswered}</span>
                <span className="text-slate-500">Answered</span>
              </div>
              <div>
                <span className="block font-extrabold text-amber-600 text-lg">{totalMarked}</span>
                <span className="text-slate-500">For Review</span>
              </div>
              <div>
                <span className="block font-extrabold text-slate-600 text-lg">{totalUnanswered}</span>
                <span className="text-slate-500">Unanswered</span>
              </div>
            </div>

            {totalUnanswered > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                You still have {totalUnanswered} unanswered question{totalUnanswered > 1 ? 's' : ''}. Unanswered questions will receive 0 points.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Continue Quiz
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  handleFinalSubmit();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Confirm & View Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Quiz Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Exit Quiz?</h3>
                <p className="text-xs text-slate-500">Unsubmitted progress will be discarded</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to leave this quiz session? You will return to the home screen.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Stay
              </button>
              <button
                onClick={onExit}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg cursor-pointer shadow-xs"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
