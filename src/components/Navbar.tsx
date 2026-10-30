import React from 'react';
import { Sparkles, BookOpen, Layers, HelpCircle, Play } from 'lucide-react';

interface NavbarProps {
  onStartCreate: () => void;
  onTryDemo: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartCreate, onTryDemo, onNavigateHome }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
                Quizora
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium hidden sm:block">
              Study Smarter, Score Higher
            </p>
          </div>
        </button>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#how-it-works"
            className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            How It Works
          </a>
          <a
            href="#features"
            className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            Features
          </a>
          <a
            href="#faq"
            className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            FAQ
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTryDemo}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200/60 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            <span>Try Demo</span>
          </button>
          <button
            onClick={onStartCreate}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg transition-all shadow-sm shadow-indigo-500/25 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create Quiz</span>
          </button>
        </div>
      </div>
    </header>
  );
};
