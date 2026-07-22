import Image from 'next/image';

import { formatPrice } from '@/lib/format';
import type { WishlistItem } from '@/lib/db/queries';
import { cn } from '@/lib/utils';

type WishlistItemCardProps = {
  item: WishlistItem;
  isEditing?: boolean;
  actions?: React.ReactNode;
};

export function WishlistItemCard({ item, isEditing = false, actions }: WishlistItemCardProps) {
  const bought = item.status === 'bought';
  const priceLabel = formatPrice(item.price, item.currency);

  return (
    <article
      className={cn(
        'relative overflow-hidden border-b border-border py-8 last:border-b-0',
        bought && 'opacity-55',
      )}
    >
      {bought && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        >
          <span className="rotate-[-12deg] select-none font-display text-4xl font-semibold uppercase tracking-[0.2em] text-faint/40 sm:text-5xl">
            Куплено
          </span>
        </div>
      )}

      <div className={cn('grid gap-5 sm:grid-cols-[160px_1fr]', bought && 'pointer-events-none select-none')}>
        <div className="relative aspect-square overflow-hidden rounded-md bg-surface">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className={cn('object-cover', bought && 'grayscale')}
            sizes="160px"
            unoptimized
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-display text-heading font-semibold text-ink">{item.name}</h2>
            {priceLabel && <p className="shrink-0 text-sm font-medium text-primary">{priceLabel}</p>}
          </div>

          {item.notes && <p className="text-pretty text-body text-copy">{item.notes}</p>}

          {item.links.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {item.links.map((link) => (
                <li key={link.id}>
                  {bought ? (
                    <span className="text-sm text-faint">{link.label}</span>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link focus-ring"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isEditing && actions && (
            <div className="pointer-events-auto relative z-20 mt-1 flex flex-wrap gap-2">{actions}</div>
          )}
        </div>
      </div>
    </article>
  );
}
