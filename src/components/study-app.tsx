"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Heart,
  House,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { modules, questions, flashcards, lessonLabel } from "@/content";
import { useStudy } from "@/hooks/use-study";
import { score, shuffled } from "@/lib/study";
import { Button } from "@/components/ui/button";
import { LessonPractice } from "@/components/study/lesson-practice";
import type { QuizAttempt, StudyModule } from "@/types/study";
const nav = [
  { href: "/", label: "Início", icon: House },
  { href: "/materias", label: "Matérias", icon: BookOpen },
  { href: "/simulados", label: "Simulados", icon: Target },
  { href: "/revisao", label: "Revisão", icon: RotateCcw },
  { href: "/resultados", label: "Resultados", icon: Trophy },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path.startsWith(href);
  const { ready, notice } = useStudy();
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header>
        <Link href="/" className="brand">
          <span className="brand-icon">
            <GraduationCap size={25} />
          </span>
          <span>
            Giovanna <b>já passou!</b>
            <small>SEU CANTINHO DE ESTUDOS</small>
          </span>
        </Link>
        <nav className="desktop-nav">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={isActive(n.href) ? "page" : undefined}
              className={isActive(n.href) ? "active" : ""}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <span className="avatar" aria-label="Giovanna">
          G<span>♥</span>
        </span>
      </header>
      <main id="conteudo" tabIndex={-1}>
        {notice && (
          <p role="status" className="notice">
            {notice}
          </p>
        )}
        {ready ? (
          children
        ) : (
          <div className="loading" role="status">
            Preparando seu cantinho de estudos…
          </div>
        )}
      </main>
      <nav className="mobile-nav" aria-label="Navegação principal">
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-current={isActive(n.href) ? "page" : undefined}
            className={isActive(n.href) ? "active" : ""}
          >
            <n.icon size={21} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
      <footer>
        Feito com carinho para a Giovanna <Heart size={13} /> Um passo de cada
        vez.
      </footer>
    </>
  );
}
function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
function modulePercent(
  module: StudyModule,
  progress: ReturnType<typeof useStudy>["progress"],
) {
  if (progress.completedLessons.includes(module.id)) return 100;
  const completed = module.sections.filter((section) =>
    progress.completedSections.includes(section.id),
  ).length;
  return Math.round((completed / module.sections.length) * 100);
}
function ModuleCard({
  module: m,
  index,
}: {
  module: StudyModule;
  index: number;
}) {
  const { progress: p } = useStudy();
  const percent = modulePercent(m, p),
    done = percent === 100,
    started = p.visitedLessons.includes(m.id) || percent > 0;
  return (
    <Link
      href={`/materias/${m.slug}`}
      className={`module-card tone-${index % 3}`}
    >
      <div className="card-top">
        <span className="module-icon">
          <BookOpen size={23} />
        </span>
        <span className="pill">
          {done ? "Concluído" : started ? "Em andamento" : "Não iniciado"}
        </span>
      </div>
      <small>
        {m.subtitle
          ? `${lessonLabel(m.id).toUpperCase()} · ${m.subtitle.toUpperCase()}`
          : `MÓDULO 0${index + 1}`}
      </small>
      <h3>{m.title}</h3>
      <p>{m.description}</p>
      <div className="module-bottom">
        <span>
          {m.sections.length} blocos · {percent}%
        </span>
        <ArrowRight size={19} />
      </div>
      <Progress value={percent} label={`Progresso em ${m.title}`} />
    </Link>
  );
}
function wrongIds(attempts: QuizAttempt[]) {
  const latest = new Map<string, boolean>();
  for (const a of attempts)
    for (const id of a.questionIds)
      latest.set(
        id,
        a.answers[id] === questions.find((q) => q.id === id)?.correctOptionId,
      );
  return [...latest].filter(([, correct]) => !correct).map(([id]) => id);
}
export function Dashboard() {
  const { progress: p } = useStudy();
  const total = p.attempts.reduce((n, a) => n + a.questionIds.length, 0),
    correct = p.attempts.reduce((n, a) => n + score(a, questions), 0),
    done = modules.filter((m) => p.completedLessons.includes(m.id)).length,
    percent = Math.round((done / modules.length) * 100),
    next =
      modules.find((m) => !p.completedLessons.includes(m.id)) || modules[0],
    errors = wrongIds(p.attempts);
  return (
    <>
      <div className="greeting">
        <div>
          <p className="eyebrow">
            <span className="tiny-dot" /> SEU FUTURO COMEÇA COM UM PASSO
          </p>
          <h1>
            Oi, Giovanna! <span className="pink">♡</span>
          </h1>
          <p>Você estuda, você aprende, você arrasa. 💗</p>
        </div>
        <span className="date-tag">
          <Sparkles size={16} /> Hoje é dia de acreditar em você
        </span>
      </div>
      <div className="dashboard-top">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-tag">
              <Sparkles size={14} /> UM POUQUINHO MELHOR A CADA DIA
            </span>
            <h2>
              O seu próximo passo
              <br />é rumo ao <em>10.</em>
            </h2>
            <p>
              Respira fundo. Seu cantinho está pronto.
              <br />
              Vamos transformar uma dúvida de cada vez em confiança?
            </p>
            <Button asChild>
              <Link href={`/materias/${next.slug}`}>
                Continuar estudando <ArrowRight size={17} />
              </Link>
            </Button>
            <small>Sem pressa. Com foco. Do seu jeito.</small>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-star">✧</span>
            <div className="book">
              <span>G</span>
              <Heart size={26} />
            </div>
            <div className="floating-note">
              <Check size={15} /> você consegue!
            </div>
            <span className="art-spark">✦</span>
          </div>
        </section>
        <section className="progress-card">
          <div className="section-label">
            <span>Seu progresso</span>
            <span className="soft-icon">
              <Trophy size={18} />
            </span>
          </div>
          <div
            className="ring"
            style={{
              background: `conic-gradient(#d84a82 ${percent}%,#f4eaf0 0)`,
            }}
          >
            <div>
              <strong>{percent}%</strong>
              <small>do caminho</small>
            </div>
          </div>
          <p>
            <strong>
              {done} de {modules.length}
            </strong>{" "}
            aulas concluídas
          </p>
          <Progress value={percent} label="Aulas concluídas" />
          <small>
            {done
              ? "Cada etapa conta. Continue assim!"
              : "Seu primeiro passo já pode começar."}
          </small>
        </section>
      </div>
      <section className="stats">
        <div>
          <span className="stat-icon lavender">
            <BookOpen />
          </span>
          <div>
            <strong>
              {done}
              <small> / {modules.length}</small>
            </strong>
            <p>Aulas concluídas</p>
          </div>
        </div>
        <div>
          <span className="stat-icon rose">
            <Target />
          </span>
          <div>
            <strong>{total}</strong>
            <p>Questões respondidas</p>
          </div>
        </div>
        <div>
          <span className="stat-icon mint">
            <Check />
          </span>
          <div>
            <strong>
              {total ? Math.round((correct / total) * 100) + "%" : "—"}
            </strong>
            <p>{total ? "De acertos" : "Seus acertos aparecerão aqui"}</p>
          </div>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">UM ASSUNTO DE CADA VEZ</p>
          <h2>Seu caminho de estudos</h2>
        </div>
        <Link href="/materias">
          Ver matérias <ArrowRight size={16} />
        </Link>
      </div>
      <div className="module-grid">
        {modules.map((m, i) => (
          <ModuleCard key={m.id} module={m} index={i} />
        ))}
      </div>
      <div className="quick-grid">
        <Link href="/simulados" className="quick-card">
          <Target />
          <div>
            <h3>Coloque em prática</h3>
            <p>Um simulado para descobrir o que você já sabe.</p>
            <b>
              Fazer simulado <ArrowRight size={15} />
            </b>
          </div>
        </Link>
        <Link href="/revisao" className="quick-card">
          <RotateCcw />
          <div>
            <h3>Revisar meus erros</h3>
            <p>
              {errors.length
                ? `${errors.length} questões para olhar com carinho.`
                : "Seus erros vão virar novas oportunidades."}
            </p>
            <b>
              Abrir revisão <ArrowRight size={15} />
            </b>
          </div>
        </Link>
      </div>
      <Link href="/emergencia" className="emergency">
        <span className="emergency-icon">
          <Zap />
        </span>
        <div>
          <h3>O tempo está curtinho?</h3>
          <p>Reúna os conceitos essenciais e faça uma revisão de emergência.</p>
        </div>
        <b>
          Revisão de emergência 🚀 <ArrowRight size={16} />
        </b>
      </Link>
      <div className="love-note">
        <Heart size={19} />
        <p>
          Você não precisa saber tudo agora. Só precisa dar o próximo passo.
          <br />
          <strong>Eu acredito em você, Gi.</strong>
        </p>
      </div>
    </>
  );
}
export function Subjects() {
  const [filter, setFilter] = useState("all");
  const { progress: p } = useStudy();
  return (
    <>
      <Heading
        eyebrow="SEU CAMINHO"
        title="Um assunto de cada vez."
        description="Escolha por onde começar. Cada pequena conquista conta."
      />
      <label className="field">
        Mostrar matérias
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="new">Não iniciadas</option>
          <option value="started">Em andamento</option>
          <option value="done">Concluídas</option>
        </select>
      </label>
      <div className="module-grid">
        {modules
          .filter(
            (m) =>
              filter === "all" ||
              (filter === "done"
                ? modulePercent(m, p) === 100
                : filter === "started"
                  ? (p.visitedLessons.includes(m.id) ||
                      modulePercent(m, p) > 0) &&
                    modulePercent(m, p) < 100
                  : !p.visitedLessons.includes(m.id) &&
                    modulePercent(m, p) === 0),
          )
          .map((m) => (
            <ModuleCard key={m.id} module={m} index={modules.indexOf(m)} />
          ))}
      </div>
      <Link className="text-link" href="/flashcards">
        Praticar com flashcards <ArrowRight size={17} />
      </Link>
    </>
  );
}
export function Lesson({ slug }: { slug: string }) {
  const m = modules.find((m) => m.slug === slug)!;
  const { progress: p, update } = useStudy();
  useEffect(() => {
    update((p) =>
      p.visitedLessons.includes(m.id)
        ? p
        : { ...p, visitedLessons: [...p.visitedLessons, m.id] },
    );
  }, [m.id, update]);
  const next = modules[modules.indexOf(m) + 1];
  return (
    <>
      <Link className="back" href="/materias">
        <ChevronLeft size={17} /> Todas as matérias
      </Link>
      <Heading
        eyebrow={m.subtitle ? `${lessonLabel(m.id).toUpperCase()} · ${m.subtitle}` : "MATERIAL DE ESTUDO"}
        title={m.title}
        description={m.description}
      />
      <div className="lesson-intro">
        <p>
          {m.instructor && <><strong>{m.instructor}</strong> · </>}
          {m.sourceFile} · {m.sourceTotalPages} páginas
        </p>
        <p>
          Progresso dos blocos:{" "}
          <strong>
            {m.sections.filter((section) => p.completedSections.includes(section.id)).length} de{" "}
            {m.sections.length}
          </strong>
        </p>
        <Progress value={modulePercent(m, p)} label={`Progresso em ${m.title}`} />
      </div>
      <div className="lesson-layout">
        <article className="panel lesson">
          {m.sections.map((s, i) => (
            <section key={s.id}>
              <span className="step-number">0{i + 1}</span>
              <h2>{s.title}</h2>
              {s.summary && <p className="lesson-summary">{s.summary}</p>}
              {s.body && <p>{s.body}</p>}
              {s.blocks && (
                <div className="lesson-blocks">
                  {s.blocks.map((block) => (
                    <section className="lesson-block" key={block.title}>
                      <h3>{block.title}</h3>
                      <p>{block.body}</p>
                    </section>
                  ))}
                </div>
              )}
              {s.steps && (
                <ol>
                  {s.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              )}
              {s.example && <blockquote>{s.example}</blockquote>}
              {s.caution && (
                <div className="caution">
                  <b>Um ponto de atenção</b>
                  <p>{s.caution}</p>
                </div>
              )}
              {s.keyTakeaway && (
                <blockquote>
                  <b>Ideia-chave</b>
                  <p>{s.keyTakeaway}</p>
                </blockquote>
              )}
              {s.sourcePages && (
                <p className="source-citation">
                  Referência: {lessonLabel(m.id)} · p. {s.sourcePages.join(", ")}
                </p>
              )}
              <Button
                variant={p.completedSections.includes(s.id) ? "outline" : "ghost"}
                onClick={() =>
                  update((current) => {
                    const completedSections = current.completedSections.includes(s.id)
                      ? current.completedSections.filter((id) => id !== s.id)
                      : [...current.completedSections, s.id];
                    const allComplete = m.sections.every((section) =>
                      completedSections.includes(section.id),
                    );
                    return {
                      ...current,
                      completedSections,
                      completedLessons: allComplete
                        ? [...new Set([...current.completedLessons, m.id])]
                        : current.completedLessons.filter((id) => id !== m.id),
                    };
                  })
                }
              >
                <Check size={17} />
                {p.completedSections.includes(s.id)
                  ? "Bloco estudado"
                  : "Marcar bloco como estudado"}
              </Button>
            </section>
          ))}
          <LessonPractice key={m.id} moduleId={m.id} />
          <Button
            onClick={() =>
              update((p) => ({
                ...p,
                completedLessons: [...new Set([...p.completedLessons, m.id])],
                completedSections: [
                  ...new Set([
                    ...p.completedSections,
                    ...m.sections.map((section) => section.id),
                  ]),
                ],
              }))
            }
          >
            <Check size={17} />
            {p.completedLessons.includes(m.id)
              ? "Aula concluída"
              : "Marcar aula como concluída"}
          </Button>
          {next && (
            <Link className="text-link" href={`/materias/${next.slug}`}>
              Próximo assunto <ArrowRight size={16} />
            </Link>
          )}
        </article>
        <aside className="panel">
          <Sparkles className="pink" />
          <h3>Guarde estas ideias</h3>
          {m.concepts.map((c) => (
            <p key={c}>{c}</p>
          ))}
          <Button asChild variant="outline">
            <Link href={`/flashcards?modulo=${m.id}`}>Revisar flashcards</Link>
          </Button>
          <Button asChild>
            <Link href={`/simulados?modulo=${m.id}`}>Quiz do módulo</Link>
          </Button>
        </aside>
      </div>
      {m.caseStudy && (
        <section className="panel case-study">
          <p className="eyebrow">CASO CLÍNICO · QUESTÃO NORTEADORA</p>
          <h2>{m.caseStudy.title}</h2>
          <p>{m.caseStudy.description}</p>
          <p className="source-citation">
            Referência: {lessonLabel(m.id)} · p. {m.caseStudy.sourcePages.join(", ")}
          </p>
          <div className="case-prompts">
            {m.caseStudy.prompts.map((prompt, index) => (
              <details className="case-prompt" key={prompt.question}>
                <summary>
                  <span>{index + 1}</span>
                  {prompt.question}
                </summary>
                <p>{prompt.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
      {m.memorization && (
        <section className="panel memorize">
          <p className="eyebrow">REVISÃO RÁPIDA</p>
          <h2>O que preciso memorizar?</h2>
          <div className="memorize-grid">
            {m.memorization.map((item) => (
              <article className="memorize-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <small>
                  Referência: {lessonLabel(m.id)} · p. {item.sourcePages.join(", ")}
                </small>
              </article>
            ))}
          </div>
        </section>
      )}
      {m.importantNotes && (
        <details className="panel lesson-notes">
          <summary>Notas importantes sobre este material</summary>
          <ul>
            {m.importantNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
export function Flashcards({ emergency = false }: { emergency?: boolean }) {
  const { progress: p, update } = useStudy();
  const [mod, setMod] = useState(initialModule),
    [index, setIndex] = useState(0),
    [flipped, setFlipped] = useState(false),
    [reviewOnly, setReviewOnly] = useState(false);
  const cards = flashcards.filter(
    (f) =>
      (mod === "all" || f.moduleId === mod) &&
      (!emergency || f.important) &&
      (!reviewOnly || p.flashcards[f.id] === "review"),
  );
  const card = cards[index % Math.max(cards.length, 1)];
  function move(delta: number) {
    setIndex((i) => (i + delta + cards.length) % cards.length);
    setFlipped(false);
  }
  return (
    <>
      {!emergency && (
        <Heading
          eyebrow="LEMBRAR É PRATICAR"
          title="Uma ideia de cada vez."
          description="Tente responder antes de virar. Você sabe mais do que imagina."
        />
      )}
      <div className="filters">
        <label className="field">
          Matéria
          <select
            value={mod}
            onChange={(e) => {
              setMod(e.target.value);
              setIndex(0);
              setFlipped(false);
            }}
          >
            <option value="all">Todas as matérias</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={reviewOnly}
            onChange={(e) => {
              setReviewOnly(e.target.checked);
              setIndex(0);
              setFlipped(false);
            }}
          />{" "}
          Só os que preciso revisar
        </label>
      </div>
      {card ? (
        <div className="flash-area">
          <p className="eyebrow">
            CARTÃO {(index % cards.length) + 1} DE {cards.length} ·{" "}
            {p.flashcards[card.id] === "known"
              ? "JÁ SEI"
              : p.flashcards[card.id] === "review"
                ? "PRECISO REVISAR"
                : "NOVO"}
          </p>
          <motion.button
            key={card.id + String(flipped)}
            initial={{ opacity: 0.4, rotateY: flipped ? -10 : 10 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.2 }}
            className="flashcard"
            onClick={() => setFlipped(!flipped)}
            aria-label={
              flipped
                ? "Resposta. Toque para ver a pergunta"
                : "Pergunta. Toque para revelar a resposta"
            }
          >
            <Layers size={27} />
            <small>{flipped ? "RESPOSTA" : "PENSE UM POUQUINHO…"}</small>
            <h2>{flipped ? card.back : card.front}</h2>
            {card.sourcePages && (
              <span className="source-citation">
                Referência: {lessonLabel(card.moduleId)} · p. {card.sourcePages.join(", ")}
              </span>
            )}
            <span>
              Toque ou pressione Enter para {flipped ? "voltar" : "revelar"} ↻
            </span>
          </motion.button>
          <div className="flash-actions">
            <Button
              variant="outline"
              disabled={!flipped}
              onClick={() => {
                update((p) => ({
                  ...p,
                  flashcards: { ...p.flashcards, [card.id]: "review" },
                }));
                move(1);
              }}
            >
              <RotateCcw size={17} /> Preciso revisar
            </Button>
            <Button
              disabled={!flipped}
              onClick={() => {
                update((p) => ({
                  ...p,
                  flashcards: { ...p.flashcards, [card.id]: "known" },
                }));
                move(1);
              }}
            >
              <Check size={17} /> Já sei
            </Button>
          </div>
          <div className="pagination">
            <Button variant="ghost" onClick={() => move(-1)}>
              <ChevronLeft />
              Anterior
            </Button>
            <Button variant="ghost" onClick={() => move(1)}>
              Próximo
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : (
        <Empty
          title="Nenhum cartão por aqui"
          text="Mude o filtro para continuar sua revisão."
        />
      )}
    </>
  );
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty panel">
      <Sparkles size={32} />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
export function Revision() {
  const { progress: p } = useStudy();
  const [mod, setMod] = useState("all");
  const ids = wrongIds(p.attempts),
    wrong = questions.filter(
      (q) => ids.includes(q.id) && (mod === "all" || q.moduleId === mod),
    );
  return (
    <>
      <Heading
        eyebrow="UM NOVO OLHAR"
        title="Erros que viram aprendizado."
        description="Sem cobrança. Aqui, cada dúvida ganha uma nova chance."
      />
      <label className="field">
        Matéria
        <select value={mod} onChange={(e) => setMod(e.target.value)}>
          <option value="all">Todas</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </label>
      {wrong.length ? (
        <>
          <Button asChild>
            <Link
              href={`/simulados?modo=erros${mod !== "all" ? `&modulo=${mod}` : ""}`}
            >
              Treinar novamente <ArrowRight size={17} />
            </Link>
          </Button>
          {wrong.map((q) => (
            <div className="panel answer-review" key={q.id}>
              <span className="eyebrow">REVISÃO · {q.subject}</span>
              <h3>{q.prompt}</h3>
              <p>
                <b>Resposta correta: {q.correctOptionId}.</b>{" "}
                {q.options.find((o) => o.id === q.correctOptionId)?.text}
              </p>
              <p>{q.explanation}</p>
              <small>{q.source}</small>
            </div>
          ))}
        </>
      ) : (
        <Empty
          title={
            ids.length
              ? "Nenhum erro nesta matéria"
              : "Tudo tranquilo por aqui ♡"
          }
          text={
            p.attempts.length
              ? "As questões acertadas na tentativa mais recente saem desta lista."
              : "Quando você finalizar um simulado, as questões erradas aparecerão aqui."
          }
        />
      )}
    </>
  );
}
export function Results() {
  const { progress: p, reset } = useStudy();
  const [confirm, setConfirm] = useState(false);
  const attempts = p.attempts,
    errors = wrongIds(attempts);
  return (
    <>
      <Heading
        eyebrow="CADA PASSO CONTA"
        title="Olha o quanto você está construindo."
        description="Seu progresso real, guardado neste navegador."
      />
      {attempts.length ? (
        <>
          <div className="panel">
            <h2>Sua evolução</h2>
            <div className="chart">
              {attempts.map((a, i) => {
                const pct = Math.round(
                  (score(a, questions) / a.questionIds.length) * 100,
                );
                return (
                  <div key={a.id} className="chart-item">
                    <b>{pct}%</b>
                    <div className="chart-track">
                      <span style={{ height: `${pct}%` }} />
                    </div>
                    <small>#{i + 1}</small>
                  </div>
                );
              })}
            </div>
            <p>
              {attempts.length < 2
                ? "Faça outra tentativa para comparar sua evolução."
                : `${Math.round((score(attempts.at(-1)!, questions) / attempts.at(-1)!.questionIds.length) * 100) >= Math.round((score(attempts[0], questions) / attempts[0].questionIds.length) * 100) ? "Seu resultado mais recente está igual ou acima do primeiro." : "Seu resultado variou. Reveja as dúvidas e continue no seu ritmo."}`}
            </p>
          </div>
          <div className="section-heading">
            <h2>Histórico de simulados</h2>
          </div>
          {[...attempts].reverse().map((a) => (
            <div className="panel" key={a.id}>
              <div className="history">
                <span className="stat-icon rose">
                  <Target />
                </span>
                <div>
                  <h3>{a.title}</h3>
                  <p>
                    {new Date(a.finishedAt!).toLocaleString("pt-BR")} ·{" "}
                    {score(a, questions)} de {a.questionIds.length} acertos
                  </p>
                </div>
                <strong>
                  {Math.round(
                    (score(a, questions) / a.questionIds.length) * 100,
                  )}
                  %
                </strong>
              </div>
              <details className="history-details">
                <summary>Ver respostas e explicações</summary>
                {a.questionIds.map((id) => {
                  const q = questions.find((q) => q.id === id);
                  if (!q) {
                    return (
                      <section key={id}>
                        <h3>Questão arquivada</h3>
                        <p>
                          Sua resposta: {a.answers[id] || "Em branco"} · Correta:{" "}
                          {a.archivedCorrectAnswers?.[id] || "indisponível"}
                        </p>
                        <p>
                          Este item fazia parte de uma versão anterior e não
                          integra mais o conteúdo de estudo.
                        </p>
                      </section>
                    );
                  }
                  return (
                    <section key={id}>
                      <h3>{q.prompt}</h3>
                      <p>
                        Sua resposta: {a.answers[id] || "Em branco"} · Correta:{" "}
                        {q.correctOptionId}
                      </p>
                      <p>
                        {
                          q.options.find((o) => o.id === q.correctOptionId)
                            ?.text
                        }
                      </p>
                      <p>{q.explanation}</p>
                    </section>
                  );
                })}
              </details>
            </div>
          ))}
          <div className="panel">
            <h2>Assuntos para revisar</h2>
            {modules.map((m) => (
              <p key={m.id}>
                {m.title}:{" "}
                <b>
                  {
                    errors.filter(
                      (id) =>
                        questions.find((q) => q.id === id)?.moduleId === m.id,
                    ).length
                  }{" "}
                  erros pendentes
                </b>
              </p>
            ))}
          </div>
        </>
      ) : (
        <Empty
          title="Sua história começa agora"
          text="Finalize seu primeiro simulado para acompanhar os resultados de verdade."
        />
      )}
      <div className="panel">
        <h2>Progresso por módulo</h2>
        {modules.map((m) => (
          <div className="module-progress" key={m.id}>
            <p>
              {m.title}{" "}
              <b>{modulePercent(m, p)}%</b>
            </p>
            <Progress
              value={modulePercent(m, p)}
              label={m.title}
            />
          </div>
        ))}
      </div>
      <Button variant="ghost" onClick={() => setConfirm(true)}>
        Reiniciar meu progresso
      </Button>
      {confirm && (
        <Confirm
          title="Reiniciar todo o progresso?"
          text="Isso apagará aulas concluídas, flashcards, histórico e o simulado em andamento deste navegador."
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            reset();
            setConfirm(false);
          }}
        />
      )}
    </>
  );
}
function Confirm({
  title,
  text,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    return () => previous?.focus();
  }, [ref]);
  return (
    <div
      className="modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
        if (e.key === "Tab") {
          e.preventDefault();
          const buttons = e.currentTarget.querySelectorAll("button");
          (document.activeElement === buttons[0]
            ? buttons[1]
            : buttons[0]
          ).focus();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-text"
        className="modal panel"
      >
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-text">{text}</p>
        <div className="flash-actions">
          <Button ref={ref} variant="outline" onClick={onCancel}>
            Voltar
          </Button>
          <Button onClick={onConfirm}>Confirmar</Button>
        </div>
      </section>
    </div>
  );
}
export function Emergency() {
  return (
    <>
      <Heading
        eyebrow="RESPIRA. VAMOS JUNTAS."
        title="Revisão de emergência 🚀"
        description="O essencial do conteúdo cadastrado, em um lugar só. Sem prever o que vai cair na prova."
      />
      <div className="panel">
        <h2>Conceitos essenciais</h2>
        {modules.map((m) => (
          <section key={m.id}>
            <h3>{m.title}</h3>
            <ul>
              {m.concepts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            {m.memorization?.map((item) => (
              <div key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.body}</p>
                <p className="source-citation">Referência: {lessonLabel(m.id)} · p. {item.sourcePages.join(", ")}</p>
              </div>
            ))}
          </section>
        ))}
      </div>
      <Flashcards emergency />
      <Button asChild>
        <Link href="/simulados?modo=rapido">
          Praticar questões rápidas <ArrowRight size={17} />
        </Link>
      </Button>
    </>
  );
}
// Shell mounts study screens only after hydration; these initializers also guard SSR.
function initialModule() {
  const value =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("modulo");
  return modules.some((m) => m.id === value) ? value! : "all";
}
const quizSubjects = [...new Set(questions.map((question) => question.subject))];
function initialSubject() {
  const value =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("assunto");
  return value && quizSubjects.includes(value) ? value : "all";
}
function initialMode() {
  const value =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("modo");
  return value && ["geral", "materia", "erros", "rapido"].includes(value)
    ? value
    : initialSubject() !== "all" || initialModule() !== "all"
      ? "materia"
      : "geral";
}
export function Quiz() {
  const { progress: p, update } = useStudy();
  const [mode, setMode] = useState(initialMode),
    [mod, setMod] = useState(initialModule),
    [subject, setSubject] = useState(initialSubject),
    [count, setCount] = useState(5),
    [index, setIndex] = useState(0),
    [result, setResult] = useState<QuizAttempt | null>(null),
    [confirm, setConfirm] = useState(false),
    [review, setReview] = useState(false);
  const draft = p.draft;
  const pool = questions.filter(
    (q) =>
      (mod === "all" || q.moduleId === mod) &&
      (subject === "all" || q.subject === subject) &&
      (mode !== "erros" || wrongIds(p.attempts).includes(q.id)),
  );
  function start() {
    const a: QuizAttempt = {
      id: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      title:
        mode === "erros"
          ? subject === "all"
            ? "Revisão de erros"
            : `Revisão de erros · ${subject}`
          : mode === "rapido"
            ? "Revisão rápida"
            : subject !== "all"
              ? subject
              : mod === "all"
              ? "Simulado geral"
              : modules.find((m) => m.id === mod)?.title || "Simulado",
      questionIds: shuffled(pool)
        .slice(0, Math.min(count, pool.length))
        .map((q) => q.id),
      answers: {},
    };
    update((p) => ({ ...p, draft: a }));
    setResult(null);
    setIndex(0);
    setReview(false);
  }
  function finish() {
    if (!draft) return;
    const final = { ...draft, finishedAt: new Date().toISOString() };
    update((p) => ({
      ...p,
      draft: null,
      attempts: p.attempts.some((a) => a.id === final.id)
        ? p.attempts
        : [...p.attempts, final],
    }));
    setResult(final);
    setConfirm(false);
    setReview(false);
  }
  if (result) {
    const correct = score(result, questions),
      pct = Math.round((correct / result.questionIds.length) * 100);
    return (
      <>
        <Heading
          eyebrow="MAIS UM PASSO DADO"
          title={
            pct === 100
              ? "Você arrasou, Gi! 💗"
              : pct >= 80
                ? "Que conquista bonita!"
                : "Cada tentativa ensina algo."
          }
          description={`${correct} de ${result.questionIds.length} respostas corretas · ${pct}% de acertos`}
        />
        {pct >= 80 && (
          <div className="celebration" aria-hidden="true">
            ✦ · ♡ · ✧ · ✦ · ♡ · ✧
          </div>
        )}
        {pct === 100 && (
          <div className="success">
            EU FALEI QUE A GIOVANNA JÁ TINHA PASSADO! 💗🎓
          </div>
        )}
        <div className="flash-actions">
          <Button
            onClick={() => {
              setResult(null);
              setIndex(0);
            }}
          >
            Novo simulado
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const retry = {
                ...result,
                id: crypto.randomUUID(),
                answers: {},
                startedAt: new Date().toISOString(),
                finishedAt: undefined,
              };
              update((p) => ({ ...p, draft: retry }));
              setResult(null);
              setIndex(0);
            }}
          >
            Refazer este simulado
          </Button>
          <Button asChild variant="ghost">
            <Link href="/resultados">Ver histórico</Link>
          </Button>
        </div>
        {result.questionIds.map((id) => {
          const q = questions.find((q) => q.id === id)!;
          const ok = result.answers[id] === q.correctOptionId;
          return (
            <div
              className={`panel answer-review ${ok ? "correct" : "incorrect"}`}
              key={id}
            >
              <span className="pill">
                {ok ? "Acertou! Muito bem ♡" : "Vamos entender juntas"}
              </span>
              <h3>{q.prompt}</h3>
              <p>Sua resposta: {result.answers[id] || "Não respondida"}</p>
              <p>
                <b>
                  Correta: {q.correctOptionId} ·{" "}
                  {q.options.find((o) => o.id === q.correctOptionId)?.text}
                </b>
              </p>
              <p>{q.explanation}</p>
              <small>{q.source}</small>
            </div>
          );
        })}
      </>
    );
  }
  if (draft) {
    if (draft.questionIds.some((id) => !questions.some((q) => q.id === id))) {
      return (
        <>
          <Heading
            eyebrow="SIMULADO SALVO"
            title="Sua tentativa anterior continua guardada."
            description="As questões desta tentativa não fazem parte do conteúdo atual."
          />
          <div className="panel">
            <p>
              Seu histórico foi preservado. Para começar com as questões da Aula
              08, encerre este rascunho anterior.
            </p>
            <Button onClick={() => update((p) => ({ ...p, draft: null }))}>
              Encerrar tentativa anterior
            </Button>
          </div>
        </>
      );
    }
    const q = questions.find(
      (q) =>
        q.id ===
        draft.questionIds[Math.min(index, draft.questionIds.length - 1)],
    )!;
    const answered = draft.questionIds.filter((id) => draft.answers[id]).length;
    return (
      <>
        <Heading
          eyebrow="UM PASSO DE CADA VEZ"
          title={draft.title}
          description="Sua tentativa é salva ao escolher uma resposta."
        />
        <Progress
          value={(answered / draft.questionIds.length) * 100}
          label="Questões respondidas"
        />
        <div className="quiz-meta">
          <span>
            Questão {index + 1} de {draft.questionIds.length}
          </span>
          <span>{answered} respondidas</span>
        </div>
        {review ? (
          <div className="panel">
            <h2>Confira antes de entregar</h2>
            {draft.questionIds.map((id, i) => (
              <button
                className="review-row"
                key={id}
                onClick={() => {
                  setIndex(i);
                  setReview(false);
                }}
              >
                Questão {i + 1}
                <b>
                  {draft.answers[id] || "Em branco"} <ChevronRight size={16} />
                </b>
              </button>
            ))}
          </div>
        ) : (
          <section className="panel question">
            <p className="eyebrow">
              {lessonLabel(q.moduleId).toUpperCase()} · {q.difficulty} · {q.subject}
            </p>
            <h2>{q.prompt}</h2>
            <fieldset>
              <legend className="sr-only">Escolha uma alternativa</legend>
              {q.options.map((o) => (
                <label
                  className={`option ${draft.answers[q.id] === o.id ? "selected" : ""}`}
                  key={o.id}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={draft.answers[q.id] === o.id}
                    onChange={() =>
                      update((p) =>
                        p.draft
                          ? {
                              ...p,
                              draft: {
                                ...p.draft,
                                answers: { ...p.draft.answers, [q.id]: o.id },
                              },
                            }
                          : p,
                      )
                    }
                  />
                  <span>{o.id}</span>
                  {o.text}
                </label>
              ))}
            </fieldset>
          </section>
        )}
        <div className="pagination">
          <Button
            variant="outline"
            disabled={index === 0 && !review}
            onClick={() => {
              if (review) setReview(false);
              else setIndex((i) => i - 1);
            }}
          >
            <ChevronLeft size={17} />
            Anterior
          </Button>
          {index < draft.questionIds.length - 1 && !review ? (
            <Button onClick={() => setIndex((i) => i + 1)}>
              Próxima <ArrowRight size={17} />
            </Button>
          ) : (
            <Button
              onClick={() => (review ? setConfirm(true) : setReview(true))}
            >
              {review ? "Entregar simulado" : "Revisar respostas"}
            </Button>
          )}
        </div>
        <Button variant="ghost" onClick={() => setReview(!review)}>
          {review ? "Voltar à questão" : "Ver todas as respostas"}
        </Button>
        {confirm && (
          <Confirm
            title="Entregar o simulado?"
            text={`${draft.questionIds.length - answered} questões em branco. Após confirmar, as respostas ficam bloqueadas e o resultado será salvo.`}
            onCancel={() => setConfirm(false)}
            onConfirm={finish}
          />
        )}
      </>
    );
  }
  return (
    <>
      <Heading
        eyebrow="PRATIQUE COM CONFIANÇA"
        title="Vamos colocar em prática?"
        description="Escolha seu ritmo. O aprendizado está em cada tentativa."
      />
      <div className="quiz-setup panel">
        <h2>Monte seu simulado</h2>
        <div className="mode-grid">
          {[
            ["geral", "Simulado geral", "Todos os assuntos"],
            ["materia", "Por assunto", "Foco em um tópico"],
            ["erros", "Meus erros", "Uma nova chance"],
            ["rapido", "Revisão rápida", "Pratique sem pressa"],
          ].map(([value, title, desc]) => (
            <button
              aria-pressed={mode === value}
              className={`mode-card ${mode === value ? "selected" : ""}`}
              key={value}
              onClick={() => {
                setMode(value);
                if (value === "geral" || value === "rapido") {
                  setMod("all");
                  setSubject("all");
                }
              }}
            >
              <Target size={22} />
              <h3>{title}</h3>
              <p>{desc}</p>
            </button>
          ))}
        </div>
        <label className="field">
          Aula
          <select value={mod} onChange={(e) => { setMod(e.target.value); setSubject("all"); }}>
            <option value="all">Misto: Aulas 08 e 09</option>
            {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
          </select>
        </label>
        {(mode === "materia" || mode === "erros") && (
          <label className="field">
            Assunto
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="all">Todos os assuntos</option>
              {quizSubjects.filter((name) => mod === "all" || questions.some((q) => q.moduleId === mod && q.subject === name)).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}
        <h3>Quantidade de questões</h3>
        <div className="count-options">
          {[5, 10, 15, 20, 25].map((n) => (
            <button
              key={n}
              aria-pressed={count === n}
              className={count === n ? "selected" : ""}
              onClick={() => setCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p>
          {pool.length} questões disponíveis. A tentativa terá{" "}
          {Math.min(count, pool.length)} questões, sem repetições.
        </p>
        <Button disabled={!pool.length} onClick={start}>
          Começar simulado <ArrowRight size={17} />
        </Button>
        {!pool.length && (
          <p role="status">
            Nenhum erro registrado para este filtro. Experimente o simulado
            geral.
          </p>
        )}
      </div>
    </>
  );
}
