'use server';

import { revalidatePath } from 'next/cache';

import { getSession, requireAuth } from '@/lib/auth';

export async function loginAction(password: string) {
  const expected = process.env.EDIT_PASSWORD;
  if (!expected) {
    return { ok: false as const, error: 'EDIT_PASSWORD не настроен' };
  }
  if (password !== expected) {
    return { ok: false as const, error: 'Неверный пароль' };
  }

  const session = await getSession();
  session.isAuthenticated = true;
  await session.save();
  revalidatePath('/');
  return { ok: true as const };
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  revalidatePath('/');
}

/** Gate helper for mutating routes (CRUD arrives in a later PR). */
export async function assertCanMutate() {
  await requireAuth();
}
