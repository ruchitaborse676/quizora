import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Upload,
  CheckCircle2,
  Sliders,
  Award,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  GraduationCap,
  Clock,
  Printer,
  HelpCircle,
  XCircle,
  Laptop
} from 'lucide-react';

interface LandingPageProps {
  onStartCreate: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartCreate, onTryDemo }) => {
  // Interactive preview state
  const [selectedPreviewOption, setSelectedPreviewOption] = useState<number | null>(null);
  const [hasCheckedPreview, setHasCheckedPreview] = useState(false);

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const previewQuestion = {
    question: 'Which biological process do eukaryotic cells use to generate the majority of their ATP during aerobic respiration?',
    options: [
      'Fermentation in the cytoplasm',
      'Glycolysis without oxygen',
      'Oxidative phosphorylation in the inner mitochondrial membrane',
      'Direct light-dependent synthesis in the stroma'
    ],
    correctIndex: 2,
    explanation: 'Oxidative phosphorylation (electron transport chain + chemiosmosis) generates approximately 26–28 of the ~30–32 ATP molecules per glucose molecule in aerobic respiration.'
  };

  const faqs = [
    {
      q: 'Are my uploaded study materials stored or shared?',
      a: 'No. Quizora AI treats all uploaded documents and notes as transient data processed purely in-memory during question generation. We do not store, harvest, or train AI models on your private documents.'
    },
    {
      q: 'What file formats can I upload?',
      a: 'Quizora AI supports PDF documents (including scanned pages via Gemini OCR), Microsoft Word (.docx), PowerPoint (.pptx), plain text (.txt), Markdown (.md), and images (JPG, PNG, WebP) of handwritten notes or textbook pages.'
    },
    {
      q: 'What is the difference between Practice Mode and Exam Mode?',
      a: 'Practice Mode allows you to check answers and view rich explanations immediately after each question with no time pressure. Exam Mode replicates real testing environments with an optional countdown timer, hidden answers, and a comprehensive review report upon completion.'
    },
    {
      q: 'Can I export or print my quiz?',
      a: 'Yes! You can instantly print or save a clean, professional PDF assessment report, or export questions and answers as a study guide.'
    },
    {
      q: 'Does Quizora AI invent facts or hallucinate questions?',
      a: 'Quizora AI is strictly instructed to generate questions faithful to the source material provided. If the material does not contain enough information, it reports the limitation rather than fabricating facts.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle decorative background gradient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-60">
          <div className="absolute -top-12 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
          <div className="absolute top-4 right-1/4 w-80 h-80 bg-violet-200/40 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[32rem] h-64 bg-blue-100/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-200/60 shadow-xs mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">
              Powered by Google Gemini 3.8 Flash
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Turn Any Study Material <br className="hidden sm:inline" />
            Into Your Next <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">A+</span>.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Upload your notes, PDFs, slides or documents. Let AI create a personalized quiz in seconds.
          </p>

          {/* Call to Actions */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartCreate}
              className="w-full sm:w-auto px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
              <span>Create My Quiz</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onTryDemo}
              className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 hover:border-slate-300 cursor-pointer"
            >
              <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
              <span>Try a Demo</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No Login Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Zero Document Retention</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-violet-600" />
              <span>4 Question Types & Multilingual</span>
            </div>
          </div>
        </div>

        {/* Interactive Quiz Preview Widget */}
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 mt-14">
          <div className="glass-panel rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 border border-indigo-100/80 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-violet-100 text-violet-700 rounded-md">
                  Interactive Preview
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Try clicking an option below
                </span>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Practice Mode
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                {previewQuestion.question}
              </p>

              <div className="grid grid-cols-1 gap-2.5 pt-1">
                {previewQuestion.options.map((option, idx) => {
                  const isSelected = selectedPreviewOption === idx;
                  const isCorrect = idx === previewQuestion.correctIndex;
                  const showResult = hasCheckedPreview;

                  let cardStyle = 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80';
                  if (isSelected && !showResult) {
                    cardStyle = 'border-indigo-500 bg-indigo-50/50 shadow-xs';
                  } else if (showResult) {
                    if (isCorrect) {
                      cardStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-950';
                    } else if (isSelected && !isCorrect) {
                      cardStyle = 'border-rose-400 bg-rose-50/70 text-rose-950';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPreviewOption(idx);
                        setHasCheckedPreview(true);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${cardStyle} cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                            isSelected && !showResult
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : showResult && isCorrect
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : showResult && isSelected && !isCorrect
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white text-slate-600 border-slate-300'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-slate-800">{option}</span>
                      </div>
                      {showResult && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {hasCheckedPreview && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 animate-in fade-in duration-300">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Explanation
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {previewQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 border-t border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              How Quizora AI Works
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Go from messy study notes to an exam-ready mastery assessment in less than 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-panel rounded-2xl p-7 border border-slate-200/80 hover:border-indigo-200 transition-all shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-extrabold text-lg flex items-center justify-center mb-5 border border-indigo-100">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Upload or Paste</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Drop your PDFs, Word documents, lecture slides, photos of textbook pages, or paste raw notes directly.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>PDF, DOCX, PPTX, TXT, Images</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-panel rounded-2xl p-7 border border-slate-200/80 hover:border-violet-200 transition-all shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 font-extrabold text-lg flex items-center justify-center mb-5 border border-violet-100">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Customize Parameters</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose question types (MCQ, True/False, Multi-select, Fill-in-the-blanks), target difficulty, negative marking, and timer.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Sliders className="w-4 h-4 text-violet-500" />
                <span>Practice Mode or Timed Exam</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-panel rounded-2xl p-7 border border-slate-200/80 hover:border-blue-200 transition-all shadow-xs relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center mb-5 border border-blue-100">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Master & Review</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take the quiz, receive instant explanations, diagnose weak topics, retry mistakes, and print clean study reports.
              </p>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <Award className="w-4 h-4 text-blue-500" />
                <span>Targeted Missed-Question Retries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50/60 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-200/60">
              Engineered for Real Learning
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Features Built for Serious Students
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Everything you need to test your comprehension accurately, without hallucinated facts or noisy gimmicks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Multimodal Document OCR</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Natively extracts content from complex PDFs, scanned lecture handouts, textbook photos, and digital slides with Gemini vision.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Strict Source Fidelity</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Untrusted document isolation prevents prompt injection and stops the AI from inventing facts or citations outside your text.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Exam & Practice Modes</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Toggle between low-stress learning with instant explanations and realistic timed mock examinations with negative marking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Targeted Error Retries</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Never waste time repeating what you already know. Launch a focused re-quiz isolating only the questions you got wrong.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Printer className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Print & Export Reports</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Download printable PDF-formatted test results or export structured questions and study guides in JSON and Markdown.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Laptop className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">Multilingual Proficiency</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generate questions fluently in English, Hindi (हिन्दी), Marathi (मराठी), and conversational Hinglish for regional learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/90 overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between text-base font-semibold text-slate-800 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-3" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-3" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy and Security Notice */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Privacy Guarantee</h4>
              <p className="text-xs sm:text-sm text-slate-300">
                Your study materials and documents are processed in-memory only and never retained or stored on permanent disks.
              </p>
            </div>
          </div>
          <button
            onClick={onStartCreate}
            className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            Create Quiz Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Quizora AI</span>
            <span>•</span>
            <span>Turn Any Study Material Into Your Next A+</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onTryDemo} className="hover:text-indigo-600 cursor-pointer">
              Demo Quiz
            </button>
            <a href="#how-it-works" className="hover:text-indigo-600">
              How It Works
            </a>
            <a href="#faq" className="hover:text-indigo-600">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
