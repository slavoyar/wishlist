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
  const statusLabel = bought ? 'куплено' : 'хочу';

  return (
    <article
      aria-label={`${item.name}, ${statusLabel}`}
      className={cn(
        'relative overflow-hidden border-b border-border py-8 last:border-b-0',
        bought && 'opacity-80',
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

      <div className={cn('grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)]', bought && 'pointer-events-none select-none')}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-surface sm:aspect-auto sm:h-[160px] sm:w-[160px] sm:shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 639px) 100vw, 160px"
            className={cn('object-cover', bought && 'grayscale')}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-display text-heading font-semibold text-ink">{item.name}</h2>
            {priceLabel && <p className="shrink-0 text-sm font-medium text-primary">{priceLabel}</p>}
          </div>

          {item.notes && <p className="text-pretty text-body text-copy">{item.notes}</p>}

          {item.links.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-3">
              {item.links.map((link) => (
                <li key={link.id}>
                  {bought ? (
                    <span className="text-sm text-faint">{link.label}</span>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link inline-flex min-h-11 items-center px-1 py-2"
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
