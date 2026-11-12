"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { questions } from "@/content";
import {
  emptyProgress,
  parseProgress,
  STORAGE_KEY,
  validateQuestions,
} from "@/lib/study";
import type { StudyProgress } from "@/types/study";
type Context = {
  progress: StudyProgress;
  update: (f: (p: StudyProgress) => StudyProgress) => void;
  ready: boolean;
  notice: string;
  reset: () => void;
};
const StudyContext = createContext<Context | null>(null);
validateQuestions(questions);
export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(emptyProgress);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const initialize = () => {
      try {
        setProgress(
          parseProgress(localStorage.getItem(STORAGE_KEY), questions),
        );
      } catch {
        setNotice(
          "Não foi possível carregar o progresso salvo. Esta sessão começou vazia.",
        );
      }
      setReady(true);
    };
    initialize();
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      const report = () =>
        setNotice(
          "O navegador não permitiu salvar. Seu progresso permanece apenas nesta sessão.",
        );
      report();
    }
  }, [progress, ready]);
  const update = useCallback(
    (f: (p: StudyProgress) => StudyProgress) => setProgress(f),
    [],
  );
  return (
    <StudyContext.Provider
      value={{
        progress,
        update,
        ready,
        notice,
        reset: () => update(() => emptyProgress()),
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}
export function useStudy() {
  const c = useContext(StudyContext);
  if (!c) throw Error("StudyProvider ausente");
  return c;
}
