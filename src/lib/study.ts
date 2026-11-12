import type { Question, QuizAttempt, StudyProgress } from "@/types/study";
export const STORAGE_KEY = "giovanna-study-v1";
const archivedDemoAnswers: Record<string, string> = {
  "demo-q1": "B",
  "demo-q2": "C",
  "demo-q3": "D",
  "demo-q4": "A",
  "demo-q5": "B",
  "demo-q6": "C",
};
export const emptyProgress = (): StudyProgress => ({
  version: 1,
  completedLessons: [],
  completedSections: [],
  visitedLessons: [],
  attempts: [],
  draft: null,
  flashcards: {},
});
export function validateQuestions(qs: Question[]) {
  const ids = new Set<string>();
  for (const q of qs) {
    if (
      !q.id ||
      ids.has(q.id) ||
      !q.moduleId ||
      !q.prompt.trim() ||
      !q.explanation.trim() ||
      !q.subject ||
      !["fácil", "média", "difícil"].includes(q.difficulty) ||
      q.options.length < 4 ||
      q.options.length > 5 ||
      new Set(q.options.map((o) => o.id)).size !== q.options.length ||
      q.options.some((o) => !o.id || !o.text.trim()) ||
      !q.options.some((o) => o.id === q.correctOptionId)
    )
      throw new Error("Questão inválida: " + q.id);
    ids.add(q.id);
  }
}
export function score(a: QuizAttempt, qs: Question[]) {
  return a.questionIds.reduce(
    (n, id) => {
      const question = qs.find((q) => q.id === id);
      const correctOptionId =
        question?.correctOptionId ?? a.archivedCorrectAnswers?.[id];
      return n + Number(Boolean(correctOptionId && correctOptionId === a.answers[id]));
    },
    0,
  );
}
export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function parseProgress(
  raw: string | null,
  qs: Question[],
): StudyProgress {
  if (!raw) return emptyProgress();
  const p = JSON.parse(raw) as StudyProgress;
  const known = new Set(qs.map((q) => q.id));
  const archived = new Set(Object.keys(archivedDemoAnswers));
  const validAttempt = (a: QuizAttempt) =>
    a &&
    typeof a.id === "string" &&
    typeof a.title === "string" &&
    typeof a.startedAt === "string" &&
    Number.isFinite(Date.parse(a.startedAt)) &&
    Array.isArray(a.questionIds) &&
    a.questionIds.length > 0 &&
    new Set(a.questionIds).size === a.questionIds.length &&
    a.questionIds.every((id) => known.has(id) || archived.has(id)) &&
    a.answers &&
    typeof a.answers === "object" &&
    Object.entries(a.answers).every(
      ([id, value]) =>
        a.questionIds.includes(id) &&
        (qs.find((q) => q.id === id)?.options.some((o) => o.id === value) ??
          ["A", "B", "C", "D"].includes(value)),
    );
  if (
    p.version !== 1 ||
    !Array.isArray(p.completedLessons) ||
    !p.completedLessons.every((id) => typeof id === "string") ||
    (p.completedSections !== undefined &&
      (!Array.isArray(p.completedSections) ||
        !p.completedSections.every((id) => typeof id === "string"))) ||
    !Array.isArray(p.visitedLessons) ||
    !p.visitedLessons.every((id) => typeof id === "string") ||
    !Array.isArray(p.attempts) ||
    !p.attempts.every(
      (a) =>
        validAttempt(a) &&
        a.finishedAt &&
        Number.isFinite(Date.parse(a.finishedAt)),
    ) ||
    new Set(p.attempts.map((a) => a.id)).size !== p.attempts.length ||
    (p.draft !== null && (!validAttempt(p.draft) || p.draft.finishedAt)) ||
    !p.flashcards ||
    typeof p.flashcards !== "object" ||
    !Object.values(p.flashcards).every((v) => v === "known" || v === "review")
  )
    throw new Error("Progresso inválido");
  const preserveArchivedResults = (attempt: QuizAttempt): QuizAttempt => {
    const archivedCorrectAnswers = {
      ...attempt.archivedCorrectAnswers,
      ...Object.fromEntries(
        attempt.questionIds
          .filter((id) => !known.has(id) && archived.has(id))
          .map((id) => [id, archivedDemoAnswers[id]]),
      ),
    };
    return Object.keys(archivedCorrectAnswers).length
      ? { ...attempt, archivedCorrectAnswers }
      : attempt;
  };
  return {
    ...p,
    completedSections: p.completedSections ?? [],
    attempts: p.attempts.map(preserveArchivedResults),
    draft: p.draft ? preserveArchivedResults(p.draft) : null,
  };
}
