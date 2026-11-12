import Link from "next/link";
export default function NotFound() {
  return (
    <section className="panel empty">
      <h1>Esse assunto ainda não está aqui.</h1>
      <Link className="btn primary" href="/materias">
        Voltar às matérias
      </Link>
    </section>
  );
}
