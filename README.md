# Giovanna Já Passou! 💗

Plataforma de estudos em Next.js App Router, TypeScript strict, Tailwind CSS 4, botão baseado no padrão shadcn/ui (Radix + CVA), Lucide e Motion. Mobile-first, sem conta, banco ou APIs pagas.

## Rodar localmente

Requer Node.js 20.9+ e npm.

```sh
npm install
npm run dev
```

Abra http://localhost:3000. No PowerShell, se scripts npm estiverem bloqueados, use `npm.cmd`.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

## Funcionalidades

- Dashboard com dados reais da sessão, progresso por aula e ações de estudo.
- Matérias com filtro de estado e aulas com seções, conceitos, exemplos, flashcard, pergunta rápida com feedback e registro, quiz e próximo assunto.
- Simulado geral, por módulo, erros e revisão rápida. A quantidade solicitada (5/10/15/20) é limitada ao banco disponível, atualmente seis questões fictícias.
- Ordem sorteada uma única vez por tentativa, rascunho persistido, navegação, revisão, confirmação e gabarito bloqueado após entrega.
- Revisão de erros usa a resposta mais recente de cada questão; acertar em nova tentativa remove o erro pendente.
- Flashcards com teclado/toque, filtros, estados de aprendizado e revisão de emergência.
- Histórico, evolução e reset com confirmação.

## Conteúdo real: onde adicionar

O catálogo contém as Aulas 08, 09, 10 e 11. O arquivo fornecido da Aula 11 está preservado em `src/content/aula-11-minerais.ts`; `src/content/aula-11-adapter.ts` adapta seus campos às interfaces existentes sem modificar os IDs. O banco completo reúne 100 questões e 72 flashcards. As questões de estudo não são perguntas oficiais da prova.

A Aula 11 inclui oito blocos com referências aos slides, 25 questões comentadas, 18 flashcards, caso clínico com três respostas reveláveis e dez lembretes de emergência. A rota é `/materias/aula-11-biodisponibilidade-minerais/`. A integração mantém a chave `giovanna-study-v1` e a versão do schema; não exige reiniciar o progresso. Casos clínicos permitem escrever uma tentativa antes de revelar as respostas; essas anotações livres não são persistidas.

1. Edite os arrays em `src/content/index.ts` com os resumos reais revisados. Os componentes consomem esses arrays, sem copiar aulas para a UI.
2. Siga os contratos `StudyModule`, `LessonSection`, `Flashcard`, `Question`, `QuizAttempt` e `StudyProgress` de `src/types/study.ts`.
3. Preserve IDs e slugs de itens existentes para manter o progresso. Cada alternativa precisa de um ID próprio; `correctOptionId` deve apontar para uma delas. Use `source` para página/PDF/aula de origem.
4. `validateQuestions` rejeita IDs duplicados, alternativas inconsistentes e dados obrigatórios ausentes. Execute os testes e o build ao atualizar o banco.
5. Os avisos de demonstração são intencionais. Ao trocar integralmente o banco por material real, revise os avisos e o campo `demonstration`; não retire avisos enquanto houver exemplos fictícios.
6. PDFs poderão gerar objetos desses mesmos contratos em um processo futuro. Nenhum parser foi incluído.

## Estrutura

- `src/app`: rotas diretas, layout, metadata, favicon, loading/error/404.
- `src/components/study-app.tsx`: dashboard e fluxos de estudo reutilizados pelas rotas.
- `src/components/ui/button.tsx`: botão acessível com variantes.
- `src/hooks/use-study.tsx`: provider e leitura/escrita segura do localStorage.
- `src/lib/study.ts`: versão do schema, validação, embaralhamento, gabarito.
- `tests/study.test.ts`: validação de questões, cálculo, randomização e corrupção do progresso.

## Persistência e limites

A chave `giovanna-study-v1` salva aulas, flashcards, rascunho e resultados. A leitura ocorre apenas após montagem para evitar divergências no SSR. Erros de armazenamento são informados e a sessão continua em memória. Dados inválidos não são carregados; o navegador não sincroniza entre aparelhos. Use uma aba por vez: não há sincronização concorrente entre abas. Limpar os dados do navegador apaga o progresso. Não há promessas de nota ou previsão da prova.

## Deploy na Vercel

Importe o repositório na Vercel e selecione Next.js; use `npm run build`. Não há variáveis de ambiente necessárias. A configuração exporta o site em `out/`, com rotas estáticas para todos os módulos cadastrados. Ao criar módulos, execute novo build para gerar suas URLs. Também é possível hospedar `out/` em servidor estático com suporte a `index.html` por diretório.
