export interface LessonSection {
  id: string;
  title: string;
  body?: string;
  summary?: string;
  blocks?: LessonBlock[];
  sourcePages?: number[];
  keyTakeaway?: string;
  steps?: string[];
  example?: string;
  caution?: string;
}
export interface LessonBlock {
  title: string;
  body: string;
}
export interface MemorizationItem {
  title: string;
  body: string;
  sourcePages: number[];
}
export interface CasePrompt {
  question: string;
  answer: string;
}
export interface StudyModule {
  number?: number;
  id: string;
  slug: string;
  title: string;
  description: string;
  sections: LessonSection[];
  concepts: string[];
  demonstration: boolean;
  subtitle?: string;
  instructor?: string;
  sourceFile?: string;
  sourceTotalPages?: number;
  caseStudy?: {
    title: string;
    description: string;
    sourcePages: number[];
    prompts: CasePrompt[];
  };
  memorization?: MemorizationItem[];
  importantNotes?: string[];
}
export interface Flashcard {
  topic?: string;
  id: string;
  moduleId: string;
  front: string;
  back: string;
  important: boolean;
  sourcePages?: number[];
}
export interface Question {
  id: string;
  moduleId: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  subject: string;
  difficulty: "fácil" | "média" | "difícil";
  source?: string;
  sourcePages?: number[];
}
export interface QuizAttempt {
  id: string;
  startedAt: string;
  finishedAt?: string;
  questionIds: string[];
  answers: Record<string, string>;
  title: string;
  archivedCorrectAnswers?: Record<string, string>;
}
export interface StudyProgress {
  version: 1;
  completedLessons: string[];
  completedSections: string[];
  visitedLessons: string[];
  attempts: QuizAttempt[];
  draft: QuizAttempt | null;
  flashcards: Record<string, "known" | "review">;
}
