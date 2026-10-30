/**
 * Quizora AI - Types
 */

export type QuestionType = 'mcq' | 'true_false' | 'multi_select' | 'fill_blank';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export type QuizLanguage = 'en' | 'hi' | 'hinglish' | 'mr';

export type QuizMode = 'practice' | 'exam';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options: string[]; // For MCQ, True/False, Multiple Select
  correctAnswers: string[]; // One or more correct answers
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
  sourceReference?: string;
}

export interface QuizConfig {
  title: string;
  questionCount: number;
  difficulty: Difficulty;
  questionTypes: QuestionType[];
  language: QuizLanguage;
  mode: QuizMode;
  timeLimitMinutes: number; // 0 = unlimited
  negativeMarking: boolean; // -0.25 for incorrect
  shuffle: boolean;
  topicFocus?: string;
  customInstructions?: string;
}

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  base64Data?: string;
  textContent?: string;
}

export interface QuizMaterial {
  textNotes: string;
  topic: string;
  files: UploadedFileItem[];
}

export interface UserAnswer {
  questionId: string;
  selectedOptions: string[];
  textAnswer?: string;
  isMarkedForReview: boolean;
  timeSpentSeconds: number;
}

export interface QuizResult {
  quizId: string;
  title: string;
  mode: QuizMode;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  rawScore: number;
  netScore: number; // with negative marking
  maxScore: number;
  percentage: number;
  negativeMarkingApplied: boolean;
  timeSpentSeconds: number;
  completedAt: string;
  answers: Record<string, UserAnswer>;
  topicBreakdown: Record<string, { total: number; correct: number }>;
}

export interface GeneratedQuizResponse {
  title: string;
  description?: string;
  questions: Question[];
  topicsIdentified?: string[];
}
