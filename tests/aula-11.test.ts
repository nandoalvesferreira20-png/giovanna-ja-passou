import { test } from "node:test";
import assert from "node:assert/strict";
import { aula11 } from "../src/content/aula-11-minerais";
import { modules, questions, flashcards } from "../src/content";
import {
  emptyProgress,
  parseProgress,
  score,
  selectQuizQuestions,
  validateQuestions,
  STORAGE_KEY,
} from "../src/lib/study";

test("Aula 11 preserva os oito blocos, conceitos, referências e caso clínico", () => {
  const lesson = modules.find((m) => m.id === aula11.id)!;
  assert.equal(lesson.number, 11);
  assert.equal(lesson.slug, aula11.slug);
  assert.equal(lesson.sections.length, 8);
  assert.equal(lesson.description, aula11.description);
  assert.equal(lesson.instructor, aula11.teacher);
  assert.equal(lesson.sourceFile, aula11.source.filename);
  assert.equal(lesson.sourceTotalPages, 28);
  aula11.sections.forEach((source, i) => {
    assert.equal(lesson.sections[i].id, source.id);
    assert.equal(lesson.sections[i].title, source.title);
    assert.deepEqual(lesson.sections[i].steps, source.paragraphs);
    assert.deepEqual(lesson.sections[i].sourcePages, source.sourcePages);
    assert.equal(lesson.sections[i].keyTakeaway, source.keyPoints.join(" "));
  });
  assert.deepEqual(
    lesson.concepts,
    aula11.sections.flatMap((s) => [...s.keyPoints]),
  );
  assert.equal(lesson.caseStudy?.description, aula11.clinicalCase.scenario);
  assert.deepEqual(lesson.caseStudy?.prompts, aula11.clinicalCase.questions);
  assert.equal(lesson.caseStudy?.prompts.length, 3);
  assert.deepEqual(lesson.caseStudy?.sourcePages, [25, 26]);
  assert.deepEqual(lesson.lastMinuteReview, aula11.lastMinuteReview);
  assert.deepEqual(lesson.importantNotes, [aula11.contentNotice]);
});

test("Aula 11 adapta 25 gabaritos e 18 cartões sem perder dados", () => {
  const bank = questions.filter((q) => q.moduleId === aula11.id);
  assert.equal(bank.length, 25);
  const difficulty = { facil: "fácil", medio: "média", dificil: "difícil" };
  aula11.questions.forEach((source, i) => {
    assert.equal(bank[i].id, source.id);
    assert.equal(bank[i].prompt, source.question);
    assert.deepEqual(bank[i].options, source.options);
    assert.equal(bank[i].correctOptionId, source.correctOption);
    assert.equal(bank[i].explanation, source.explanation);
    assert.equal(bank[i].subject, source.topic);
    assert.equal(bank[i].difficulty, difficulty[source.difficulty]);
    assert.deepEqual(bank[i].sourcePages, source.sourcePages);
  });
  const cards = flashcards.filter((f) => f.moduleId === aula11.id);
  assert.equal(cards.length, 18);
  aula11.flashcards.forEach((source, i) => {
    assert.equal(cards[i].id, source.id);
    assert.equal(cards[i].front, source.front);
    assert.equal(cards[i].back, source.back);
    assert.deepEqual(cards[i].sourcePages, source.sourcePages);
    assert.equal(cards[i].important, true);
  });
  validateQuestions(questions);
  for (const ids of [
    modules.map((m) => m.id),
    modules.map((m) => m.slug),
    modules.flatMap((m) => m.sections.map((s) => s.id)),
    questions.map((q) => q.id),
    flashcards.map((f) => f.id),
  ])
    assert.equal(new Set(ids).size, ids.length);
  const ids = new Set(modules.map((m) => m.id));
  assert.ok(
    [...questions, ...flashcards].every((item) => ids.has(item.moduleId)),
  );
});

test("progresso e histórico antigos sobrevivem à inclusão independente da Aula 11", () => {
  const oldModules = modules.filter((m) => m.id !== aula11.id);
  const oldBank = questions.filter((q) => q.moduleId !== aula11.id);
  const now = new Date().toISOString();
  const previous = {
    ...emptyProgress(),
    completedLessons: oldModules.map((m) => m.id),
    completedSections: oldModules.flatMap((m) => m.sections.map((s) => s.id)),
    visitedLessons: oldModules.map((m) => m.id),
    flashcards: Object.fromEntries(
      flashcards
        .filter((f) => f.moduleId !== aula11.id)
        .map((f) => [f.id, "known" as const]),
    ),
    attempts: [
      {
        id: "antes-da-aula11",
        title: "Histórico original",
        startedAt: now,
        finishedAt: now,
        questionIds: oldBank.map((q) => q.id),
        answers: Object.fromEntries(
          oldBank.map((q) => [q.id, q.correctOptionId]),
        ),
      },
    ],
    draft: {
      id: "rascunho-original",
      title: "Em andamento",
      startedAt: now,
      questionIds: [oldBank[0].id],
      answers: { [oldBank[0].id]: oldBank[0].correctOptionId },
    },
  };
  assert.equal(STORAGE_KEY, "giovanna-study-v1");
  const restored = parseProgress(JSON.stringify(previous), questions);
  assert.deepEqual(restored, previous);
  assert.equal(score(restored.attempts[0], questions), 75);
  const updated = {
    ...restored,
    completedSections: [...restored.completedSections, aula11.sections[0].id],
    visitedLessons: [...restored.visitedLessons, aula11.id],
    flashcards: {
      ...restored.flashcards,
      [aula11.flashcards[0].id]: "review" as const,
    },
  };
  const next = parseProgress(JSON.stringify(updated), questions);
  assert.deepEqual(next.completedLessons, previous.completedLessons);
  assert.deepEqual(next.attempts, previous.attempts);
  assert.deepEqual(next.draft, previous.draft);
  for (const [id, status] of Object.entries(previous.flashcards))
    assert.equal(next.flashcards[id], status);
  assert.equal(next.completedSections.length, 25);
  assert.equal(next.flashcards[aula11.flashcards[0].id], "review");
});

test("simulado geral representa as quatro aulas e o individual usa somente a Aula 11", () => {
  for (const count of [5, 10, 15, 20]) {
    const mixed = selectQuizQuestions(questions, count);
    assert.equal(mixed.length, count);
    assert.deepEqual(
      new Set(mixed.map((q) => q.moduleId)),
      new Set(modules.map((m) => m.id)),
    );
    assert.equal(new Set(mixed.map((q) => q.id)).size, count);
  }
  const individual = selectQuizQuestions(
    questions.filter((q) => q.moduleId === aula11.id),
    25,
  );
  assert.equal(individual.length, 25);
  assert.ok(individual.every((q) => q.moduleId === aula11.id));
  assert.equal(
    score(
      {
        id: "a11",
        title: "Aula 11",
        startedAt: new Date().toISOString(),
        questionIds: individual.map((q) => q.id),
        answers: Object.fromEntries(
          individual.map((q) => [q.id, q.correctOptionId]),
        ),
      },
      questions,
    ),
    25,
  );
});
