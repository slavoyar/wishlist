import { asc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { itemLinks, items, type Item, type ItemLink } from '@/lib/db/schema';

export type WishlistItem = Item & { links: ItemLink[] };

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const allItems = await db.select().from(items).orderBy(asc(items.sortOrder), asc(items.id));
  const allLinks = await db.select().from(itemLinks).orderBy(asc(itemLinks.sortOrder), asc(itemLinks.id));

  const linksByItem = new Map<number, ItemLink[]>();
  for (const link of allLinks) {
    const list = linksByItem.get(link.itemId) ?? [];
    list.push(link);
    linksByItem.set(link.itemId, list);
  }

  const wanted = allItems.filter((item) => item.status === 'wanted');
  const bought = allItems.filter((item) => item.status === 'bought');

  return [...wanted, ...bought].map((item) => ({
    ...item,
    links: linksByItem.get(item.id) ?? [],
  }));
}

export async function getWishlistItem(id: number): Promise<WishlistItem | null> {
  const [item] = await db.select().from(items).where(eq(items.id, id)).limit(1);
  if (!item) return null;
  const links = await db
    .select()
    .from(itemLinks)
    .where(eq(itemLinks.itemId, id))
    .orderBy(asc(itemLinks.sortOrder), asc(itemLinks.id));
  return { ...item, links };
}
