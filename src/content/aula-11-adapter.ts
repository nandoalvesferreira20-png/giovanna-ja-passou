import { aula11 } from "@/content/aula-11-minerais";
import type { Flashcard, Question, StudyModule } from "@/types/study";

// Keep the supplied source intact and translate only the application's field names.
const difficulty = {
  facil: "fácil",
  medio: "média",
  dificil: "difícil",
} as const;

export const aula11Module: StudyModule = {
  id: aula11.id,
  number: aula11.number,
  slug: aula11.slug,
  title: `Aula 11 — ${aula11.title}`,
  subtitle: aula11.subtitle,
  description: aula11.description,
  instructor: aula11.teacher,
  sourceFile: aula11.source.filename,
  sourceTotalPages: aula11.source.pages,
  demonstration: false,
  expandableSections: true,
  sections: aula11.sections.map((section) => ({
    id: section.id,
    title: section.title,
    steps: [...section.paragraphs],
    keyTakeaway: section.keyPoints.join(" "),
    sourcePages: [...section.sourcePages],
  })),
  concepts: aula11.sections.flatMap((section) => [...section.keyPoints]),
  caseStudy: {
    title: aula11.clinicalCase.title,
    description: aula11.clinicalCase.scenario,
    sourcePages: [...aula11.clinicalCase.sourcePages],
    prompts: aula11.clinicalCase.questions.map((prompt) => ({ ...prompt })),
  },
  lastMinuteReview: [...aula11.lastMinuteReview],
  importantNotes: [aula11.contentNotice],
};

export const aula11Questions: Question[] = aula11.questions.map((question) => ({
  id: question.id,
  moduleId: aula11.id,
  prompt: question.question,
  options: question.options.map((option) => ({ ...option })),
  correctOptionId: question.correctOption,
  explanation: question.explanation,
  subject: question.topic,
  difficulty: difficulty[question.difficulty],
  sourcePages: [...question.sourcePages],
  source: `Aula 11 · p. ${question.sourcePages.join(", ")}`,
}));

export const aula11Flashcards: Flashcard[] = aula11.flashcards.map((card) => ({
  id: card.id,
  moduleId: aula11.id,
  front: card.front,
  back: card.back,
  important: true,
  sourcePages: [...card.sourcePages],
}));
