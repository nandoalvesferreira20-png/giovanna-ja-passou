"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="panel empty">
      <h1>Vamos tentar mais uma vez?</h1>
      <p>Não foi possível abrir esta parte do seu cantinho.</p>
      <button className="btn primary" onClick={reset}>
        Tentar novamente
      </button>
    </section>
  );
}
