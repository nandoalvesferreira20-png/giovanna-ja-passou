"use client";

import { useState } from "react";
import { flashcards, questions, lessonLabel } from "@/content";
import { useStudy } from "@/hooks/use-study";
import { Button } from "@/components/ui/button";

export function LessonPractice({ moduleId }: { moduleId: string }) {
  const card = flashcards.find((f) => f.moduleId === moduleId);
  const question = questions.find((q) => q.moduleId === moduleId);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const { update } = useStudy();

  function respond(value: string) {
    if (!question || answer) return;
    setAnswer(value);
    const now = new Date().toISOString();
    const attempt = {
      id: crypto.randomUUID(),
      title: `Pergunta rápida · ${lessonLabel(moduleId)}`,
      startedAt: now,
      finishedAt: now,
      questionIds: [question.id],
      answers: { [question.id]: value },
    };
    update((p) => ({ ...p, attempts: [...p.attempts, attempt] }));
  }

  return (
    <section className="lesson-practice">
      {card && (
        <>
          <h2>Teste sua memória</h2>
          <button
            className="mini-flashcard"
            onClick={() => setRevealed(!revealed)}
            aria-expanded={revealed}
          >
            <span className="eyebrow">FLASHCARD · {lessonLabel(moduleId).toUpperCase()}</span>
            <strong>{revealed ? card.back : card.front}</strong>
            {card.sourcePages && (
              <small>Referência: {lessonLabel(moduleId)} · p. {card.sourcePages.join(", ")}</small>
            )}
            <small>Toque ou pressione Enter para virar ↻</small>
          </button>
          {revealed && (
            <div className="flash-actions">
              <Button
                variant="outline"
                onClick={() =>
                  update((p) => ({
                    ...p,
                    flashcards: { ...p.flashcards, [card.id]: "review" },
                  }))
                }
              >
                Preciso revisar
              </Button>
              <Button
                onClick={() =>
                  update((p) => ({
                    ...p,
                    flashcards: { ...p.flashcards, [card.id]: "known" },
                  }))
                }
              >
                Já sei
              </Button>
            </div>
          )}
        </>
      )}
      {question && (
        <>
          <h2>Pergunta rápida</h2>
          <p>{question.prompt}</p>
          <div className="quick-answers">
            {question.options.map((o) => (
              <Button
                key={o.id}
                variant="outline"
                disabled={answer !== null}
                onClick={() => respond(o.id)}
              >
                {o.id}. {o.text}
              </Button>
            ))}
          </div>
          {answer && (
            <div className="caution" role="status">
              <b>
                {answer === question.correctOptionId
                  ? "Acertou! Muito bem, Gi ♡"
                  : "Vamos entender juntas ♡"}
              </b>
              <p>
                Correta: {question.correctOptionId}. {question.explanation}
              </p>
              <small>
                {question.source} · A resposta foi registrada no seu histórico.
              </small>
            </div>
          )}
        </>
      )}
    </section>
  );
}
