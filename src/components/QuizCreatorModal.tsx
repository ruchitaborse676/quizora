import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Trash2,
  AlertCircle,
  Sparkles,
  Sliders,
  Clock,
  Layers,
  HelpCircle,
  FileCheck,
  Languages,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Play
} from 'lucide-react';
import {
  QuizConfig,
  QuizMaterial,
  UploadedFileItem,
  QuestionType,
  Difficulty,
  QuizLanguage,
  QuizMode
} from '../types/quiz';
import { processUploadedFile, formatBytes, MAX_FILE_COUNT, MAX_TOTAL_SIZE_BYTES } from '../utils/fileParser';

interface QuizCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: { title: string; questions: any[]; config: QuizConfig }) => void;
  onUseDemo: () => void;
}

export const QuizCreatorModal: React.FC<QuizCreatorModalProps> = ({
  isOpen,
  onClose,
  onQuizGenerated,
  onUseDemo
}) => {
  // Tabs for input material
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'topic'>('upload');

  // Material state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [pastedNotes, setPastedNotes] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [topicContext, setTopicContext] = useState('');

  // Config state
  const [title, setTitle] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [customCount, setCustomCount] = useState<string>('');
  const [isCustomCount, setIsCustomCount] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'mcq',
    'true_false',
    'multi_select',
    'fill_blank'
  ]);
  const [language, setLanguage] = useState<QuizLanguage>('en');
  const [mode, setMode] = useState<QuizMode>('practice');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // File handling
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFileError(null);

    if (uploadedFiles.length + files.length > MAX_FILE_COUNT) {
      setFileError(`You can upload at most ${MAX_FILE_COUNT} files.`);
      return;
    }

    setIsProcessingFile(true);
    const newItems: UploadedFileItem[] = [];

    let currentTotalSize = uploadedFiles.reduce((acc, f) => acc + f.size, 0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (currentTotalSize + file.size > MAX_TOTAL_SIZE_BYTES) {
        setFileError(`Total upload exceeds limit of ${formatBytes(MAX_TOTAL_SIZE_BYTES)}.`);
        break;
      }

      const res = await processUploadedFile(file);
      if (res.error) {
        setFileError(res.error);
      } else if (res.item) {
        newItems.push(res.item);
        currentTotalSize += res.item.size;
      }
    }

    setUploadedFiles((prev) => [...prev, ...newItems]);
    setIsProcessingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length === 1) {
        // Keep at least one
        return;
      }
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const totalCalculatedCount = isCustomCount
    ? Math.max(1, Math.min(50, parseInt(customCount, 10) || 10))
    : questionCount;

  // Generate quiz submission
  const handleGenerate = async () => {
    setGenerationError(null);
    setIsApiKeyMissing(false);

    // Validation
    const hasFiles = uploadedFiles.length > 0;
    const hasNotes = pastedNotes.trim().length > 15;
    const hasTopic = topicInput.trim().length > 2;

    if (!hasFiles && !hasNotes && !hasTopic) {
      setGenerationError(
        'Please upload at least one document, paste your study notes, or specify a topic.'
      );
      return;
    }

    const config: QuizConfig = {
      title: title.trim() || topicInput.trim() || (uploadedFiles[0]?.name ? `Quiz: ${uploadedFiles[0].name.replace(/\.[^/.]+$/, '')}` : 'Personalized Assessment'),
      questionCount: totalCalculatedCount,
      difficulty,
      questionTypes: selectedTypes,
      language,
      mode,
      timeLimitMinutes: mode === 'exam' ? timeLimitMinutes : 0,
      negativeMarking,
      shuffle: shuffleQuestions,
      topicFocus: topicInput.trim() || undefined,
      customInstructions: customInstructions.trim() || undefined
    };

    const material: QuizMaterial = {
      textNotes: pastedNotes.trim(),
      topic: topicInput.trim() + (topicContext.trim() ? `\nContext: ${topicContext.trim()}` : ''),
      files: uploadedFiles
    };

    setIsGenerating(true);
    setGenerationStep('Analyzing study materials & extracting key concepts...');

    const stepTimer1 = setTimeout(() => {
      setGenerationStep('Formulating rigorous questions & plausible distractors...');
    }, 2800);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep('Verifying single-truth answer keys and learning explanations...');
    }, 6000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, material })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isApiKeyMissing) {
          setIsApiKeyMissing(true);
        }
        throw new Error(data.error || 'Failed to generate quiz. Please check server logs.');
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      onQuizGenerated({
        title: data.title || config.title,
        questions: data.questions,
        config
      });
      onClose();
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const message = err instanceof Error ? err.message : 'Unknown generation error';
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Create New Quiz</h2>
              <p className="text-xs text-slate-500">Configure your study material & quiz rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Study Material */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Step 1: Provide Study Content
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Choose any source
              </span>
            </div>

            {/* Input Method Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-3.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
                {uploadedFiles.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                    {uploadedFiles.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'paste'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Paste Notes</span>
                {pastedNotes.trim().length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('topic')}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'topic'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Topic / Concept</span>
                {topicInput.trim().length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            {/* Tab 1: Upload Files */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md,.markdown,.pptx,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                  <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to browse or drag and drop your study material
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PDF (scanned & digital), Word (.docx), Slides (.pptx), Markdown, TXT, and Images (JPG/PNG/WebP)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Up to 5 files (max 10MB per file, 25MB total)
                  </p>
                </div>

                {isProcessingFile && (
                  <div className="flex items-center gap-2 p-3 text-xs text-indigo-700 bg-indigo-50 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting document content & preparing multimodal parts...</span>
                  </div>
                )}

                {fileError && (
                  <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 rounded-lg border border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* Uploaded File List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-slate-600">Attached Files:</span>
                    <div className="space-y-1.5">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate max-w-[85%]">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{file.name}</span>
                            <span className="text-slate-400">({formatBytes(file.size)})</span>
                            {file.base64Data && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 rounded font-semibold">
                                Multimodal
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Paste Notes */}
            {activeTab === 'paste' && (
              <div>
                <textarea
                  value={pastedNotes}
                  onChange={(e) => setPastedNotes(e.target.value)}
                  placeholder="Paste your lecture notes, textbook excerpts, summary points, or study guides here..."
                  className="w-full h-36 p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 resize-none"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>Aim for at least 1-2 paragraphs for optimal question depth.</span>
                  <span>{pastedNotes.length} characters</span>
                </div>
              </div>
            )}

            {/* Tab 3: Topic / Concept */}
            {activeTab === 'topic' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Subject / Topic Name
                  </label>
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="e.g. Organic Chemistry: Alkenes and Electrophilic Addition"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Additional Context or Target Exam (Optional)
                  </label>
                  <input
                    type="text"
                    value={topicContext}
                    onChange={(e) => setTopicContext(e.target.value)}
                    placeholder="e.g. AP Chemistry, NEET, University Midterm, or High School level"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Quiz Configuration Controls */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Step 2: Customize Quiz Rules
            </label>

            {/* Question Count */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Number of Questions
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[5, 10, 15, 20, 30].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setQuestionCount(num);
                      setIsCustomCount(false);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      !isCustomCount && questionCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {num} Qs
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomCount(true)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    isCustomCount
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Custom
                </button>
                {isCustomCount && (
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                    placeholder="1-50"
                    className="w-20 px-2 py-1.5 text-xs rounded-lg border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </div>
            </div>

            {/* Difficulty & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Difficulty Level
                </span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  {(['easy', 'medium', 'hard', 'mixed'] as Difficulty[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                        difficulty === lvl
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Quiz Mode
                </span>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setMode('practice')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      mode === 'practice'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Practice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('exam')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      mode === 'exam'
                        ? 'bg-white text-indigo-700 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Timed Exam</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Question Types */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Include Question Formats
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mcq', label: 'Multiple Choice (MCQ)' },
                  { id: 'true_false', label: 'True / False' },
                  { id: 'multi_select', label: 'Multiple Select' },
                  { id: 'fill_blank', label: 'Fill in Blanks' }
                ].map((item) => {
                  const isChecked = selectedTypes.includes(item.id as QuestionType);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleQuestionType(item.id as QuestionType)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950 font-semibold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language & Exam Timer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-indigo-600" />
                  Language
                </span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as QuizLanguage)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="hinglish">Hinglish (Hindi in Roman script)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
              </div>

              {mode === 'exam' && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Timer Duration
                  </span>
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value={5}>5 Minutes</option>
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              )}
            </div>

            {/* Advanced Checkboxes */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Negative Marking (-0.25 per wrong answer)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Shuffle Questions</span>
              </label>
            </div>

            {/* Custom Educator Guidance (optional) */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">
                Custom Focus / Instructions (Optional)
              </span>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g. Focus on mechanism diagrams, definitions, or high-yield exam traps"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Error Banner */}
          {generationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs text-rose-800 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Quiz Generation Failed</span>
              </div>
              <p>{generationError}</p>
              {isApiKeyMissing && (
                <div className="pt-2 border-t border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-[11px] text-rose-700">
                    Want to test right now without setting up an API key?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onUseDemo();
                    }}
                    className="px-3 py-1 bg-white text-indigo-700 font-bold rounded-lg border border-indigo-200 shadow-xs hover:bg-indigo-50 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-indigo-600 fill-indigo-600" />
                    <span>Launch Pre-loaded Demo Quiz</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {uploadedFiles.length > 0
              ? `${uploadedFiles.length} file(s) attached`
              : pastedNotes.length > 0
              ? 'Notes provided'
              : topicInput.length > 0
              ? 'Topic specified'
              : 'Select material above'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-sm shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{generationStep || 'Generating Quiz...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
