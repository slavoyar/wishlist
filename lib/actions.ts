'use server';

import { revalidatePath } from 'next/cache';
import { asc, eq, max } from 'drizzle-orm';

import { requireAuth } from '@/lib/auth';
import { loginAction, logoutAction } from '@/lib/auth-actions';
import { db } from '@/lib/db';
import { itemLinks, items, type Currency, type ItemStatus } from '@/lib/db/schema';

export { loginAction, logoutAction };

export type LinkInput = {
  label: string;
  url: string;
};

export type ItemInput = {
  name: string;
  imageUrl: string;
  notes?: string | null;
  price?: number | null;
  currency?: Currency | null;
  status?: ItemStatus;
  links?: LinkInput[];
};

function normalizeItemInput(input: ItemInput) {
  const name = input.name?.trim();
  const imageUrl = input.imageUrl?.trim();
  if (!name) throw new Error('Укажите название');
  if (!imageUrl) throw new Error('Укажите ссылку на изображение');

  const links = (input.links ?? [])
    .map((link) => ({
      label: link.label.trim(),
      url: link.url.trim(),
    }))
    .filter((link) => link.label && link.url);

  return {
    name,
    imageUrl,
    notes: input.notes?.trim() || null,
    price: input.price ?? null,
    currency: input.currency ?? 'RUB',
    status: input.status ?? 'wanted',
    links,
  };
}

export async function createItemAction(input: ItemInput) {
  await requireAuth();
  const data = normalizeItemInput(input);
  const now = new Date();

  const [{ value: maxOrder }] = await db
    .select({ value: max(items.sortOrder) })
    .from(items)
    .where(eq(items.status, 'wanted'));

  const [created] = await db
    .insert(items)
    .values({
      name: data.name,
      imageUrl: data.imageUrl,
      notes: data.notes,
      price: data.price,
      currency: data.currency,
      status: data.status,
      sortOrder: (maxOrder ?? -1) + 1,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: items.id });

  if (data.links.length > 0) {
    await db.insert(itemLinks).values(
      data.links.map((link, index) => ({
        itemId: created.id,
        label: link.label,
        url: link.url,
        sortOrder: index,
      })),
    );
  }

  revalidatePath('/');
  return { ok: true as const, id: created.id };
}

export async function updateItemAction(id: number, input: ItemInput) {
  await requireAuth();
  const data = normalizeItemInput(input);
  const now = new Date();

  await db
    .update(items)
    .set({
      name: data.name,
      imageUrl: data.imageUrl,
      notes: data.notes,
      price: data.price,
      currency: data.currency,
      status: data.status,
      updatedAt: now,
    })
    .where(eq(items.id, id));

  await db.delete(itemLinks).where(eq(itemLinks.itemId, id));
  if (data.links.length > 0) {
    await db.insert(itemLinks).values(
      data.links.map((link, index) => ({
        itemId: id,
        label: link.label,
        url: link.url,
        sortOrder: index,
      })),
    );
  }

  revalidatePath('/');
  return { ok: true as const };
}

export async function deleteItemAction(id: number) {
  await requireAuth();
  await db.delete(items).where(eq(items.id, id));
  revalidatePath('/');
  return { ok: true as const };
}

export async function setItemStatusAction(id: number, status: ItemStatus) {
  await requireAuth();
  await db.update(items).set({ status, updatedAt: new Date() }).where(eq(items.id, id));
  revalidatePath('/');
  return { ok: true as const };
}

export async function moveItemAction(id: number, direction: 'up' | 'down') {
  await requireAuth();

  const wanted = await db
    .select()
    .from(items)
    .where(eq(items.status, 'wanted'))
    .orderBy(asc(items.sortOrder), asc(items.id));

  const index = wanted.findIndex((item) => item.id === id);
  if (index === -1) return { ok: false as const, error: 'Можно менять порядок только у желаемых' };

  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= wanted.length) {
    return { ok: true as const };
  }

  const current = wanted[index];
  const other = wanted[swapWith];

  await db
    .update(items)
    .set({ sortOrder: other.sortOrder, updatedAt: new Date() })
    .where(eq(items.id, current.id));
  await db
    .update(items)
    .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
    .where(eq(items.id, other.id));

  revalidatePath('/');
  return { ok: true as const };
}

export async function reorderWantedAction(orderedIds: number[]) {
  await requireAuth();
  const now = new Date();
  for (let i = 0; i < orderedIds.length; i += 1) {
    await db.update(items).set({ sortOrder: i, updatedAt: now }).where(eq(items.id, orderedIds[i]));
  }
  revalidatePath('/');
  return { ok: true as const };
}
