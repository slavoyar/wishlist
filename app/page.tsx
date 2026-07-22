import { WishlistApp } from '@/components/wishlist-app';
import { isAuthenticated } from '@/lib/auth';
import { getWishlistItems } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [items, authenticated] = await Promise.all([getWishlistItems(), isAuthenticated()]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-[var(--space-section)] sm:px-8">
      <WishlistApp items={items} authenticated={authenticated} />
    </main>
  );
}
