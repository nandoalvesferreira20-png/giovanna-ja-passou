import { test } from "node:test";
import assert from "node:assert/strict";
import { flashcards, modules, questions } from "../src/content/index";
import {
  emptyProgress,
  parseProgress,
  score,
  shuffled,
  selectQuizQuestions,
  modulePerformance,
  validateQuestions,
} from "../src/lib/study";
test("Aula 08 disponibiliza os blocos, questões e cartões do material", () => {
  assert.equal(modules.length, 3);
  assert.equal(modules[0].sections.length, 8);
  assert.equal(questions.filter((q) => q.moduleId === modules[0].id).length, 25);
  assert.equal(flashcards.filter((f) => f.moduleId === modules[0].id).length, 18);
  assert.equal(modules[0].caseStudy?.prompts.length, 4);
  assert.ok(questions.every((q) => q.sourcePages && q.sourcePages.length > 0));
  assert.doesNotThrow(() => validateQuestions(questions));
  assert.throws(() => validateQuestions([...questions, questions[0]]));
  assert.throws(() =>
    validateQuestions([{ ...questions[0], correctOptionId: "Z" }]),
  );
});
test("gabarito conta acertos e não pontua questões em branco", () => {
  assert.equal(
    score(
      {
        id: "a",
        title: "teste",
        startedAt: new Date().toISOString(),
        questionIds: questions.map((q) => q.id),
        answers: Object.fromEntries(
          questions.map((q) => [q.id, q.correctOptionId]),
        ),
      },
      questions,
    ),
    questions.length,
  );
  assert.equal(
    score(
      {
        id: "b",
        title: "teste",
        startedAt: new Date().toISOString(),
        questionIds: [questions[0].id],
        answers: {},
      },
      questions,
    ),
    0,
  );
});
test("embaralhar preserva as questões sem duplicar ou mutar a origem", () => {
  const original = questions.map((q) => q.id),
    copy = [...original];
  assert.deepEqual(shuffled(original).sort(), [...original].sort());
  assert.deepEqual(original, copy);
});
test("persistência rejeita corrupção, versão desconhecida e duplicação", () => {
  const empty = emptyProgress();
  assert.deepEqual(parseProgress(JSON.stringify(empty), questions), empty);
  assert.deepEqual(
    parseProgress(
      JSON.stringify({ ...empty, completedSections: undefined }),
      questions,
    ).completedSections,
    [],
  );
  assert.throws(() => parseProgress("{", questions));
  assert.throws(() =>
    parseProgress(JSON.stringify({ ...empty, version: 2 }), questions),
  );
  const a = {
    id: "a",
    title: "teste",
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    questionIds: [questions[0].id],
    answers: { [questions[0].id]: questions[0].correctOptionId },
  };
  assert.equal(
    parseProgress(JSON.stringify({ ...empty, attempts: [a] }), questions)
      .attempts.length,
    1,
  );
  assert.throws(() =>
    parseProgress(JSON.stringify({ ...empty, attempts: [a, a] }), questions),
  );
  assert.throws(() =>
    parseProgress(
      JSON.stringify({
        ...empty,
        draft: {
          ...a,
          finishedAt: undefined,
          answers: { [questions[0].id]: "Z" },
        },
      }),
      questions,
    ),
  );
});
test("histórico legado e seu resultado continuam disponíveis", () => {
  const now = new Date().toISOString();
  const legacy = {
    ...emptyProgress(),
    completedSections: undefined,
    attempts: [
      {
        id: "legacy",
        title: "Simulado anterior",
        startedAt: now,
        finishedAt: now,
        questionIds: ["demo-q1"],
        answers: { "demo-q1": "B" },
      },
    ],
  };
  const parsed = parseProgress(JSON.stringify(legacy), questions);
  assert.equal(parsed.attempts.length, 1);
  assert.equal(score(parsed.attempts[0], questions), 1);
});

test("Aula 09 preserva integralmente o material no modelo da aplicação", async () => {
  const { aula09 } = await import("../src/content/aula-09");
  const lesson = modules.find((m) => m.id === aula09.id)!;
  assert.equal(lesson.sections.length, 8);
  aula09.sections.forEach((section, index) => {
    assert.deepEqual(lesson.sections[index].steps, section.summary);
    assert.deepEqual(lesson.sections[index].sourcePages, section.sourcePages);
    assert.equal(lesson.sections[index].keyTakeaway, section.takeaway);
  });
  const bank = questions.filter((q) => q.moduleId === lesson.id);
  assert.equal(bank.length, 25);
  aula09.questions.forEach((original, index) => {
    const adapted = bank[index];
    assert.equal(adapted.prompt, original.statement);
    assert.deepEqual(adapted.options, original.options);
    assert.equal(adapted.correctOptionId, original.correctOptionId);
    assert.equal(adapted.explanation, original.explanation);
    assert.equal(adapted.difficulty, original.difficulty === "médio" ? "média" : original.difficulty);
    assert.deepEqual(adapted.sourcePages, original.sourcePages);
  });
  const cards = flashcards.filter((f) => f.moduleId === lesson.id);
  assert.equal(cards.length, 18);
  aula09.flashcards.forEach((original, index) => {
    assert.equal(cards[index].front, original.front);
    assert.equal(cards[index].back, original.back);
    assert.deepEqual(cards[index].sourcePages, original.sourcePages);
  });
  assert.deepEqual(lesson.caseStudy?.prompts, aula09.clinicalCase.questions.map((q) => ({ question: q.prompt, answer: q.modelAnswer })));
  aula09.quickReview.forEach((item) => assert.ok(lesson.memorization?.some((m) => m.body === item.mustKnow)));
  assert.ok(lesson.importantNotes?.includes(aula09.source.note));
  assert.equal(new Set(modules.flatMap((m) => m.sections.map((s) => s.id))).size, 24);
  assert.equal(new Set(flashcards.map((f) => f.id)).size, 54);
});

test("progresso da Aula 08 permanece intacto ao persistir a Aula 09 e simulados mistos", () => {
  const first = modules[0], second = modules[1];
  const old = { ...emptyProgress(), completedLessons: [first.id], completedSections: first.sections.map((s) => s.id), visitedLessons: [first.id], flashcards: { [flashcards[0].id]: "known" as const } };
  assert.deepEqual(parseProgress(JSON.stringify(old), questions), old);
  const now = new Date().toISOString();
  const mixedQuestions = [questions[0], questions.find((q) => q.moduleId === second.id)!];
  const next = { ...old, completedSections: [...old.completedSections, second.sections[0].id], visitedLessons: [...old.visitedLessons, second.id], attempts: [{ id: "mixed", title: "Aulas 08 e 09", startedAt: now, finishedAt: now, questionIds: mixedQuestions.map((q) => q.id), answers: Object.fromEntries(mixedQuestions.map((q) => [q.id, q.correctOptionId])) }] };
  const restored = parseProgress(JSON.stringify(next), questions);
  assert.deepEqual(restored, next);
  assert.deepEqual(restored.completedLessons, [first.id]);
  assert.equal(restored.completedSections.filter((id) => first.sections.some((s) => s.id === id)).length, 8);
  assert.equal(restored.completedSections.filter((id) => second.sections.some((s) => s.id === id)).length, 1);
  assert.equal(score(restored.attempts[0], questions), 2);
});

test("Aula 10: conteudo integral, referencias e totais reais", async () => {
  const { aula10 } = await import("../src/content/aula-10");
  assert.equal(modules.length, 3);
  assert.equal(questions.length, 75);
  assert.equal(flashcards.length, 54);
  const lesson = modules.find((m) => m.id === aula10.id)!;
  assert.equal(lesson.sections.length, 8);
  aula10.sections.forEach((section, index) => {
    assert.deepEqual(lesson.sections[index].steps, section.summary);
    assert.deepEqual(lesson.sections[index].sourcePages, section.sourcePages);
    assert.equal(lesson.sections[index].keyTakeaway, section.takeaway);
    assert.equal(lesson.sections[index].title, section.title);
  });
  const bank = questions.filter((q) => q.moduleId === lesson.id);
  assert.equal(bank.length, 25);
  aula10.questions.forEach((original, index) => {
    const adapted = bank[index];
    assert.equal(adapted.prompt, original.statement);
    assert.deepEqual(adapted.options, original.options);
    assert.equal(adapted.correctOptionId, original.correctOptionId);
    assert.equal(adapted.explanation, original.explanation);
    assert.equal(adapted.subject, original.topic);
    assert.equal(adapted.difficulty, original.difficulty === "médio" ? "média" : original.difficulty);
    assert.deepEqual(adapted.sourcePages, original.sourcePages);
  });
  const cards = flashcards.filter((f) => f.moduleId === lesson.id);
  assert.equal(cards.length, 18);
  aula10.flashcards.forEach((original, index) => {
    assert.equal(cards[index].front, original.front);
    assert.equal(cards[index].back, original.back);
    assert.equal(cards[index].topic, original.topic);
    assert.deepEqual(cards[index].sourcePages, original.sourcePages);
  });
  assert.deepEqual(lesson.caseStudy?.prompts, aula10.clinicalCase.questions.map((q) => ({ question: q.prompt, answer: q.modelAnswer })));
  assert.deepEqual(lesson.caseStudy?.sourcePages, [30]);
  assert.equal(lesson.caseStudy?.description, aula10.clinicalCase.scenario);
  aula10.quickReview.forEach((item) => assert.ok(lesson.memorization?.some((m) => m.body === item.mustKnow)));
  assert.deepEqual(lesson.importantNotes, [aula10.source.note, ...aula10.importantNotes]);
  assert.ok(lesson.memorization?.find((m) => m.title.includes("Colina"))?.body.includes("IOM/NASEM AI"));
  assert.ok(lesson.memorization?.find((m) => m.title.includes("B6") && m.title !== "B6")?.body.includes("51+"));
  assert.doesNotThrow(() => validateQuestions(questions));
});

test("simulado misto inclui as tres aulas sem duplicar ou alterar gabaritos", () => {
  const snapshot = JSON.stringify(questions);
  for (let i = 0; i < 30; i++) {
    const mixed = selectQuizQuestions(questions, 10);
    assert.equal(mixed.length, 10);
    assert.equal(new Set(mixed.map((q) => q.id)).size, 10);
    assert.deepEqual(new Set(mixed.map((q) => q.moduleId)), new Set(modules.map((m) => m.id)));
  }
  for (const lesson of modules) {
    const exclusive = selectQuizQuestions(questions.filter((q) => q.moduleId === lesson.id), 25);
    assert.equal(exclusive.length, 25);
    assert.ok(exclusive.every((q) => q.moduleId === lesson.id));
  }
  assert.deepEqual(selectQuizQuestions([], 10), []);
  assert.equal(selectQuizQuestions(questions.slice(0, 2), 10).length, 2);
  assert.equal(JSON.stringify(questions), snapshot);
});

test("persistencia independente das tres aulas, rascunho misto e desempenho real", () => {
  const now = new Date().toISOString();
  const selected = modules.map((m) => questions.find((q) => q.moduleId === m.id)!);
  const attempt = { id: "three", title: "Misto", startedAt: now, finishedAt: now, questionIds: selected.map((q) => q.id), answers: { [selected[0].id]: selected[0].correctOptionId, [selected[2].id]: selected[2].correctOptionId } };
  const state = { ...emptyProgress(), completedLessons: [modules[0].id], completedSections: [modules[0].sections[0].id, modules[1].sections[0].id, modules[2].sections[0].id], visitedLessons: modules.map((m) => m.id), attempts: [attempt], draft: { ...attempt, id: "draft", finishedAt: undefined }, flashcards: Object.fromEntries(modules.map((m) => [flashcards.find((f) => f.moduleId === m.id)!.id, "review" as const])) };
  const restored = parseProgress(JSON.stringify(state), questions);
  assert.deepEqual(restored, JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.completedLessons, [modules[0].id]);
  assert.equal(restored.completedSections.length, 3);
  assert.equal(Object.keys(restored.flashcards).length, 3);
  assert.equal(score(restored.attempts[0], questions), 2);
  assert.deepEqual(modulePerformance(restored.attempts, questions, modules[0].id), { total: 1, correct: 1, percent: 100 });
  assert.deepEqual(modulePerformance(restored.attempts, questions, modules[1].id), { total: 1, correct: 0, percent: 0 });
  assert.equal(modulePerformance([], questions, modules[2].id).percent, null);
});
