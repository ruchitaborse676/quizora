import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  Printer,
  Download,
  PlusCircle,
  Flag,
  ArrowRight,
  BookOpen,
  Sparkles,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import { QuizResult, Question, QuizConfig } from '../types/quiz';

interface QuizResultsViewProps {
  result: QuizResult;
  questions: Question[];
  config: QuizConfig;
  onRetakeAll: () => void;
  onRetryIncorrect: (incorrectQuestions: Question[]) => void;
  onCreateNew: () => void;
}

export const QuizResultsView: React.FC<QuizResultsViewProps> = ({
  result,
  questions,
  config,
  onRetakeAll,
  onRetryIncorrect,
  onCreateNew
}) => {
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct' | 'review'>('all');

  // Trigger celebration confetti on high score
  useEffect(() => {
    if (result.percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  }, [result.percentage]);

  const incorrectQuestions = questions.filter((q) => {
    const ans = result.answers[q.id];
    if (!ans) return true;

    if (q.type === 'multi_select') {
      const userSet = new Set((ans.selectedOptions || []).map((s) => s.trim().toLowerCase()));
      const correctSet = new Set(q.correctAnswers.map((s) => s.trim().toLowerCase()));
      return !(userSet.size === correctSet.size && [...userSet].every((i) => correctSet.has(i)));
    } else if (q.type === 'fill_blank') {
      const userVal = (ans.textAnswer || ans.selectedOptions?.[0] || '').trim().toLowerCase();
      return !q.correctAnswers.some((c) => c.trim().toLowerCase() === userVal);
    } else {
      const userSelected = (ans.selectedOptions?.[0] || '').trim().toLowerCase();
      return !q.correctAnswers.some((c) => c.trim().toLowerCase() === userSelected);
    }
  });

  // Filter questions for detailed view
  const filteredQuestions = questions.filter((q) => {
    const ans = result.answers[q.id];
    const isIncorrect = incorrectQuestions.some((iq) => iq.id === q.id);

    if (filter === 'incorrect') return isIncorrect;
    if (filter === 'correct') return !isIncorrect && ans?.selectedOptions?.length;
    if (filter === 'review') return ans?.isMarkedForReview;
    return true;
  });

  // Export Study Guide as Markdown
  const handleExportMarkdown = () => {
    let md = `# ${result.title} - Assessment Report\n\n`;
    md += `**Date:** ${new Date(result.completedAt).toLocaleDateString()}\n`;
    md += `**Score:** ${result.netScore} / ${result.maxScore} (${result.percentage}%)\n`;
    md += `**Correct:** ${result.correctCount} | **Incorrect:** ${result.incorrectCount} | **Unanswered:** ${result.unansweredCount}\n\n`;
    md += `---\n\n## Questions & Detailed Solutions\n\n`;

    questions.forEach((q, i) => {
      const ans = result.answers[q.id];
      const isIncorrect = incorrectQuestions.some((iq) => iq.id === q.id);

      md += `### ${i + 1}. ${q.question}\n`;
      if (q.options?.length) {
        q.options.forEach((opt, idx) => {
          md += `- ${String.fromCharCode(65 + idx)}. ${opt}\n`;
        });
      }
      md += `\n- **Your Answer:** ${
        ans?.selectedOptions?.join(', ') || ans?.textAnswer || '_Unanswered_'
      } ${isIncorrect ? '❌' : '✅'}\n`;
      md += `- **Correct Answer:** ${q.correctAnswers.join(', ')}\n`;
      md += `- **Explanation:** ${q.explanation}\n`;
      if (q.sourceReference) {
        md += `- **Source Reference:** ${q.sourceReference}\n`;
      }
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${result.title.replace(/\s+/g, '_')}_Study_Guide.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print results report
  const handlePrint = () => {
    window.print();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const getScoreBadge = (pct: number) => {
    if (pct >= 90) return { label: 'Outstanding Mastery', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (pct >= 75) return { label: 'Proficient', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (pct >= 50) return { label: 'Needs Practice', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Review Recommended', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const badge = getScoreBadge(result.percentage);

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero Score Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${badge.color}">
                <Trophy className="w-3.5 h-3.5" />
                <span>{badge.label}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {result.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Assessment completed in {formatSeconds(result.timeSpentSeconds)} • Mode: <span className="capitalize font-semibold">{result.mode}</span>
              </p>
            </div>

            {/* Score Ring / Card */}
            <div className="flex items-center gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
              <div className="text-center">
                <span className="block text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {result.percentage}%
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overall Score
                </span>
              </div>

              <div className="h-12 w-px bg-slate-200" />

              <div className="text-left text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Score: </span>
                  <span className="font-bold text-slate-800">
                    {result.netScore} / {result.maxScore}
                  </span>
                </div>
                {result.negativeMarkingApplied && (
                  <div className="text-[11px] text-amber-700">
                    (Includes -0.25 negative marking)
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Status: </span>
                  <span className="font-bold text-emerald-600">{result.correctCount} Correct</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-slate-100">
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Correct</span>
              </div>
              <p className="text-2xl font-black text-emerald-900 mt-1">{result.correctCount}</p>
            </div>

            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Incorrect</span>
              </div>
              <p className="text-2xl font-black text-rose-900 mt-1">{result.incorrectCount}</p>
            </div>

            <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Unanswered</span>
              </div>
              <p className="text-2xl font-black text-slate-800 mt-1">{result.unansweredCount}</p>
            </div>

            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-800 text-xs font-bold uppercase">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Pacing</span>
              </div>
              <p className="text-2xl font-black text-indigo-900 mt-1">
                {Math.round(result.timeSpentSeconds / questions.length)}s <span className="text-xs font-normal text-slate-500">/ q</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            {incorrectQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => onRetryIncorrect(incorrectQuestions)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Missed Questions ({incorrectQuestions.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onRetakeAll}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Retake Entire Quiz</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportMarkdown}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Study Guide</span>
            </button>

            <button
              type="button"
              onClick={onCreateNew}
              className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Quiz</span>
            </button>
          </div>
        </div>

        {/* Topic Breakdown Bar Chart */}
        {Object.keys(result.topicBreakdown).length > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Topic-by-Topic Performance
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries(result.topicBreakdown).map(([topic, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={topic} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800">{topic}</span>
                      <span className="text-slate-500 font-mono">
                        {stats.correct} / {stats.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 75
                            ? 'bg-emerald-500'
                            : pct >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Question-by-Question Review</h3>
              <p className="text-xs text-slate-500">
                Inspect correct answers, educational rationales, and source citations
              </p>
            </div>

            {/* Filter pills */}
            <div className="no-print flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                  filter === 'incorrect'
                    ? 'bg-white text-rose-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Incorrect ({incorrectQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('correct')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                  filter === 'correct'
                    ? 'bg-white text-emerald-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Correct ({result.correctCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('review')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                  filter === 'review'
                    ? 'bg-white text-amber-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flagged
              </button>
            </div>
          </div>

          {/* Question cards list */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const ans = result.answers[q.id];
              const isIncorrect = incorrectQuestions.some((iq) => iq.id === q.id);
              const userVal =
                ans?.selectedOptions?.join(', ') || ans?.textAnswer || 'Unanswered';

              return (
                <div
                  key={q.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isIncorrect
                      ? 'bg-rose-50/20 border-rose-200'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          isIncorrect ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}
                      >
                        {isIncorrect ? '✕' : '✓'}
                      </span>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Question {questions.findIndex((item) => item.id === q.id) + 1}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-medium uppercase bg-slate-100 text-slate-600 rounded">
                        {q.type}
                      </span>
                      {q.topic && (
                        <span className="text-xs text-slate-500 hidden sm:inline">• {q.topic}</span>
                      )}
                    </div>

                    {ans?.isMarkedForReview && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Flag className="w-3 h-3" /> Flagged
                      </span>
                    )}
                  </div>

                  <p className="text-base font-bold text-slate-900 mb-3">{q.question}</p>

                  {/* Options list */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
                      {q.options.map((opt, optIdx) => {
                        const isCorrectOpt = q.correctAnswers.some(
                          (c) => c.trim().toLowerCase() === opt.trim().toLowerCase()
                        );
                        const isUserOpt = ans?.selectedOptions?.includes(opt);

                        let style = 'border-slate-200 bg-slate-50/50 text-slate-700';
                        if (isCorrectOpt) {
                          style = 'border-emerald-400 bg-emerald-50/80 text-emerald-950 font-bold';
                        } else if (isUserOpt && !isCorrectOpt) {
                          style = 'border-rose-300 bg-rose-50/70 text-rose-950 line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-400">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isCorrectOpt && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Correct
                              </span>
                            )}
                            {isUserOpt && !isCorrectOpt && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                Your Pick
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Answer Comparison summary */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-600">Your Answer:</span>
                      <span
                        className={`font-semibold ${
                          isIncorrect ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {userVal}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-600">Correct Answer:</span>
                      <span className="font-semibold text-emerald-700">
                        {q.correctAnswers.join(', ')}
                      </span>
                    </div>

                    {/* Explanation */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1 font-bold text-indigo-700 uppercase tracking-wider text-[11px] mb-0.5">
                        <Sparkles className="w-3 h-3" />
                        Explanation
                      </div>
                      <p className="text-slate-600 leading-relaxed">{q.explanation}</p>
                    </div>

                    {q.sourceReference && (
                      <p className="text-[11px] text-slate-400 italic pt-1">
                        Source: {q.sourceReference}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
