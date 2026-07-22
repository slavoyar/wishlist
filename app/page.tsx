import { WishlistItemCard } from '@/components/wishlist-item-card';
import { getWishlistItems } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const items = await getWishlistItems();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-[var(--space-section)] sm:px-8">
      <header className="mb-10 flex flex-col gap-3">
        <p className="font-display text-display font-semibold text-ink">Wishlist</p>
        <p className="text-prose text-body-lg">Вещи, которые я планирую купить.</p>
      </header>

      <section>
        {items.length === 0 ? (
          <div className="border-t border-border pt-10">
            <p className="text-muted">Пока здесь пусто. Добавьте первую позицию.</p>
          </div>
        ) : (
          <div className="border-t border-border">
            {items.map((item) => (
              <WishlistItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
