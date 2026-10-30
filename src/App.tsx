import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { QuizCreatorModal } from './components/QuizCreatorModal';
import { QuizTakingView } from './components/QuizTakingView';
import { QuizResultsView } from './components/QuizResultsView';
import { DEMO_QUESTIONS, DEMO_QUIZ_CONFIG } from './data/demoQuiz';
import { Question, QuizConfig, QuizResult } from './types/quiz';
import { ArrowRight, RotateCcw } from 'lucide-react';

type AppView = 'landing' | 'taking' | 'results';

interface ActiveQuizState {
  title: string;
  questions: Question[];
  config: QuizConfig;
}

const STORAGE_ACTIVE_QUIZ = 'quizora_active_quiz_v1';
const STORAGE_LAST_RESULT = 'quizora_last_result_v1';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Active quiz data
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizState | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Restore cached session if available
  useEffect(() => {
    try {
      const savedQuiz = localStorage.getItem(STORAGE_ACTIVE_QUIZ);
      const savedResult = localStorage.getItem(STORAGE_LAST_RESULT);

      if (savedQuiz) {
        const parsed = JSON.parse(savedQuiz);
        if (parsed?.questions?.length > 0) {
          setActiveQuiz(parsed);
        }
      }

      if (savedResult) {
        const parsedResult = JSON.parse(savedResult);
        if (parsedResult?.quizId) {
          setQuizResult(parsedResult);
        }
      }
    } catch {
      // Storage unavailable or invalid JSON
    }
  }, []);

  // Launch demo quiz
  const handleStartDemo = () => {
    const demoQuizData: ActiveQuizState = {
      title: DEMO_QUIZ_CONFIG.title,
      questions: DEMO_QUESTIONS,
      config: DEMO_QUIZ_CONFIG,
    };
    setActiveQuiz(demoQuizData);
    setQuizResult(null);
    setCurrentView('taking');
    try {
      localStorage.setItem(STORAGE_ACTIVE_QUIZ, JSON.stringify(demoQuizData));
    } catch {
      // ignore
    }
  };

  // Launch newly generated quiz
  const handleQuizGenerated = (quizData: ActiveQuizState) => {
    setActiveQuiz(quizData);
    setQuizResult(null);
    setCurrentView('taking');
    try {
      localStorage.setItem(STORAGE_ACTIVE_QUIZ, JSON.stringify(quizData));
    } catch {
      // ignore
    }
  };

  // Quiz completed
  const handleQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setCurrentView('results');
    try {
      localStorage.setItem(STORAGE_LAST_RESULT, JSON.stringify(result));
    } catch {
      // ignore
    }
  };

  // Retake entire quiz
  const handleRetakeAll = () => {
    if (activeQuiz) {
      setQuizResult(null);
      setCurrentView('taking');
    }
  };

  // Retry missed questions only
  const handleRetryIncorrect = (incorrectQuestions: Question[]) => {
    if (!activeQuiz || incorrectQuestions.length === 0) return;

    const retryQuizData: ActiveQuizState = {
      title: `${activeQuiz.title} (Missed Questions Review)`,
      questions: incorrectQuestions,
      config: {
        ...activeQuiz.config,
        questionCount: incorrectQuestions.length,
      },
    };

    setActiveQuiz(retryQuizData);
    setQuizResult(null);
    setCurrentView('taking');
    try {
      localStorage.setItem(STORAGE_ACTIVE_QUIZ, JSON.stringify(retryQuizData));
    } catch {
      // ignore
    }
  };

  // Reset to landing page
  const handleExitQuiz = () => {
    setCurrentView('landing');
  };

  // Clear session data
  const handleClearSession = () => {
    try {
      localStorage.removeItem(STORAGE_ACTIVE_QUIZ);
      localStorage.removeItem(STORAGE_LAST_RESULT);
    } catch {
      // ignore
    }
    setActiveQuiz(null);
    setQuizResult(null);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen text-slate-800 bg-[#fcfcfd] flex flex-col font-sans">
      {/* Navbar (hidden during active quiz taking for focus mode) */}
      {currentView !== 'taking' && (
        <Navbar
          onStartCreate={() => setIsCreatorOpen(true)}
          onTryDemo={handleStartDemo}
          onNavigateHome={() => setCurrentView('landing')}
        />
      )}

      {/* Resume Banner on Landing Page if active quiz exists */}
      {currentView === 'landing' && activeQuiz && (
        <div className="bg-indigo-600 text-white px-4 py-2.5 text-xs font-semibold">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>You have an ongoing quiz in progress: "{activeQuiz.title}"</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('taking')}
                className="underline hover:text-indigo-200 flex items-center gap-1 cursor-pointer"
              >
                <span>Resume Quiz</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                onClick={handleClearSession}
                className="text-indigo-200 hover:text-white cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartCreate={() => setIsCreatorOpen(true)}
            onTryDemo={handleStartDemo}
          />
        )}

        {currentView === 'taking' && activeQuiz && (
          <QuizTakingView
            quiz={activeQuiz}
            onComplete={handleQuizComplete}
            onExit={handleExitQuiz}
          />
        )}

        {currentView === 'results' && quizResult && activeQuiz && (
          <QuizResultsView
            result={quizResult}
            questions={activeQuiz.questions}
            config={activeQuiz.config}
            onRetakeAll={handleRetakeAll}
            onRetryIncorrect={handleRetryIncorrect}
            onCreateNew={() => {
              setCurrentView('landing');
              setIsCreatorOpen(true);
            }}
          />
        )}
      </div>

      {/* Quiz Creation Modal */}
      <QuizCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onQuizGenerated={handleQuizGenerated}
        onUseDemo={handleStartDemo}
      />
    </div>
  );
}
