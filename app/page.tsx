export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-[var(--space-section)] sm:px-8">
      <header className="mb-10 flex flex-col gap-3">
        <p className="font-display text-display font-semibold text-ink">Wishlist</p>
        <p className="text-prose text-body-lg">Вещи, которые я планирую купить.</p>
      </header>

      <section className="flex flex-1 flex-col items-start justify-center border-t border-border pt-10">
        <p className="text-muted">Пока здесь пусто. Скоро появятся позиции из списка желаний.</p>
      </section>
    </main>
  );
}
