import { aula09 } from "@/content/aula-09";
import { aula08 } from "@/content/aula-08";
import type { StudyModule, Flashcard, Question } from "@/types/study";

const moduleId = aula08.id;

const aula08Module: StudyModule = {
  number: 8,
  id: aula08.id,
  slug: aula08.slug,
  title: aula08.title,
  subtitle: aula08.subtitle,
  description: aula08.goal,
  instructor: aula08.instructor,
  sourceFile: aula08.sourceFile,
  sourceTotalPages: aula08.sourceTotalPages,
  demonstration: aula08.isDemo,
  sections: aula08.sections.map((section) => ({
    id: section.id,
    title: section.title,
    summary: section.summary,
    sourcePages: [...section.sourcePages],
    blocks: section.blocks.map((block) => ({ ...block })),
    keyTakeaway: section.keyTakeaway,
  })),
  concepts: aula08.sections.map((section) => section.keyTakeaway),
  caseStudy: {
    title: aula08.caseStudy.title,
    description: aula08.caseStudy.description,
    sourcePages: [...aula08.caseStudy.sourcePages],
    prompts: aula08.caseStudy.prompts.map((prompt) => ({ ...prompt })),
  },
  memorization: [
    {
      title: "Recomendações de folato (B9)",
      body: "Adultos: 400 µg DFE/dia; gestação: 600 µg DFE/dia; lactação: 500 µg DFE/dia. O UL para adultos é 1.000 µg/dia de ácido fólico de suplementos e alimentos fortificados; não inclui o folato natural.",
      sourcePages: [12],
    },
    {
      title: "Recomendações de vitamina B12",
      body: "Adultos: 2,4 µg/dia; gestação: 2,6 µg/dia; lactação: 2,8 µg/dia.",
      sourcePages: [22],
    },
    {
      title: "Onde ocorre a absorção?",
      body: "Folato: principalmente no intestino delgado proximal (duodeno e jejuno). B12: o complexo B12–fator intrínseco é captado no íleo terminal.",
      sourcePages: [14, 23, 24],
    },
    {
      title: "Transportadores e proteínas",
      body: "Folato: PCFT (SLC46A1) e RFC (SLC19A1). B12: haptocorrina (TCN1), fator intrínseco, receptor ileal CUBAM (cubilina/amnionless) e transcobalamina (TCN2), que forma holotranscobalamina.",
      sourcePages: [14, 23, 24, 31, 35],
    },
    {
      title: "Biomarcadores",
      body: "Homocisteína pode aumentar na deficiência de B9 ou B12 e é pouco específica. MMA tende a aumentar na deficiência funcional de B12 e é mais específico, mas disfunção renal também pode elevá-lo. Folato sérico responde mais rapidamente à ingestão recente; folato eritrocitário foi historicamente usado para avaliação de prazo maior. Hemograma, VCM, B12 sérica total e holotranscobalamina complementam a avaliação.",
      sourcePages: [18, 28, 31],
    },
    {
      title: "Folate trap (armadilha do metilfolato)",
      body: "Na deficiência de B12, a metionina sintase fica prejudicada. O 5-MTHF não transfere adequadamente seu grupo metil, a regeneração de THF diminui e o folato fica funcionalmente indisponível para outras vias.",
      sourcePages: [27],
    },
  ],
  importantNotes: [...aula08.importantNotes],
};

const aula09Module: StudyModule = {
  id: aula09.id,
  number: aula09.number,
  slug: aula09.slug,
  title: `Aula 09 — ${aula09.title}`,
  subtitle: aula09.subtitle,
  description: "Compreender formas, funções, absorção, biodisponibilidade, fontes, recomendações, deficiências e genética das vitaminas B1, B2 e B3.",
  instructor: aula09.instructor,
  sourceFile: aula09.source.filename,
  sourceTotalPages: aula09.source.totalPages,
  demonstration: false,
  sections: aula09.sections.map((section) => ({
    id: section.id,
    title: section.title,
    steps: [...section.summary],
    sourcePages: [...section.sourcePages],
    keyTakeaway: section.takeaway,
  })),
  concepts: aula09.sections.map((section) => section.takeaway),
  caseStudy: {
    title: aula09.clinicalCase.title,
    description: aula09.clinicalCase.scenario,
    sourcePages: [...aula09.clinicalCase.sourcePages],
    prompts: aula09.clinicalCase.questions.map((question) => ({
      question: question.prompt,
      answer: question.modelAnswer,
    })),
  },
  memorization: [
    ...aula09.quickReview.map((item) => ({
      title: item.topic,
      body: item.mustKnow,
      sourcePages: [28],
    })),
    ...aula09.recommendedIntakes.map((item) => ({
      title: `Recomendações de ${item.vitamin}`,
      body: `Homens: ${item.men} ${item.unit}; mulheres: ${item.women} ${item.unit}; gestação: ${item.pregnancy} ${item.unit}; lactação: ${item.lactation} ${item.unit}.`,
      sourcePages: [...item.sourcePages],
    })),
  ],
  importantNotes: [aula09.source.note],
};

export const modules: StudyModule[] = [aula08Module, aula09Module];
export function lessonLabel(moduleId: string) {
  const lesson = modules.find((item) => item.id === moduleId);
  return lesson?.number ? `Aula ${String(lesson.number).padStart(2, "0")}` : "Aula";
}

export const flashcards: Flashcard[] = aula08.flashcards.map((card) => ({
  id: card.id,
  moduleId,
  front: card.front,
  back: card.back,
  important: true,
  sourcePages: [...card.sourcePages],
}));

export const questions: Question[] = aula08.questions.map((question) => ({
  id: question.id,
  moduleId,
  prompt: question.statement,
  options: question.options.map((option) => ({ ...option })),
  correctOptionId: question.correctOptionId,
  explanation: question.explanation,
  subject:
    aula08.sections.find((section) => section.id === question.sectionId)?.title ??
    question.sectionId,
  difficulty: question.difficulty,
  sourcePages: [...question.sourcePages],
  source: `Aula 08 · p. ${question.sourcePages.join(", ")}`,
}));

flashcards.push(...aula09.flashcards.map((card) => ({
  id: card.id,
  moduleId: aula09.id,
  front: card.front,
  back: card.back,
  topic: card.topic,
  important: true,
  sourcePages: [...card.sourcePages],
})));

questions.push(...aula09.questions.map((question) => ({
  id: question.id,
  moduleId: aula09.id,
  prompt: question.statement,
  options: question.options.map((option) => ({ ...option })),
  correctOptionId: question.correctOptionId,
  explanation: question.explanation,
  subject: question.topic,
  difficulty: question.difficulty === "médio" ? "média" as const : question.difficulty,
  sourcePages: [...question.sourcePages],
  source: `Aula 09 · p. ${question.sourcePages.join(", ")}`,
})));
