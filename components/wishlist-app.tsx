'use client';

import { useState, useTransition } from 'react';

import {
  createItemAction,
  deleteItemAction,
  loginAction,
  logoutAction,
  moveItemAction,
  setItemStatusAction,
  updateItemAction,
  type ItemInput,
} from '@/lib/actions';
import type { WishlistItem } from '@/lib/db/queries';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WishlistItemCard } from '@/components/wishlist-item-card';

type WishlistAppProps = {
  items: WishlistItem[];
  authenticated: boolean;
};

type LinkDraft = { label: string; url: string };

type FormState = {
  name: string;
  imageUrl: string;
  notes: string;
  price: string;
  currency: 'RUB' | 'USD' | 'EUR';
  status: 'wanted' | 'bought';
  links: LinkDraft[];
};

const emptyForm = (): FormState => ({
  name: '',
  imageUrl: '',
  notes: '',
  price: '',
  currency: 'RUB',
  status: 'wanted',
  links: [{ label: '', url: '' }],
});

function itemToForm(item: WishlistItem): FormState {
  return {
    name: item.name,
    imageUrl: item.imageUrl,
    notes: item.notes ?? '',
    price: item.price == null ? '' : String(item.price),
    currency: (item.currency as FormState['currency']) || 'RUB',
    status: item.status,
    links:
      item.links.length > 0
        ? item.links.map((link) => ({ label: link.label, url: link.url }))
        : [{ label: '', url: '' }],
  };
}

function formToInput(form: FormState): ItemInput {
  const priceValue = form.price.trim() === '' ? null : Number(form.price);
  return {
    name: form.name,
    imageUrl: form.imageUrl,
    notes: form.notes,
    price: Number.isFinite(priceValue as number) ? priceValue : null,
    currency: form.currency,
    status: form.status,
    links: form.links,
  };
}

export function WishlistApp({ items, authenticated }: WishlistAppProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditingItem(null);
    setForm(emptyForm());
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(item: WishlistItem) {
    setEditingItem(item);
    setForm(itemToForm(item));
    setFormError(null);
    setFormOpen(true);
  }

  function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError(null);
    startTransition(async () => {
      const result = await loginAction(password);
      if (!result.ok) {
        setLoginError(result.error);
        return;
      }
      setPassword('');
      setLoginOpen(false);
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    const input = formToInput(form);
    startTransition(async () => {
      try {
        if (editingItem) {
          await updateItemAction(editingItem.id, input);
        } else {
          await createItemAction(input);
        }
        setFormOpen(false);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Не удалось сохранить');
      }
    });
  }

  const wantedItems = items.filter((entry) => entry.status === 'wanted');
  const wantedIndexById = new Map(wantedItems.map((entry, index) => [entry.id, index] as const));
  const wantedCount = wantedItems.length;

  return (
    <>
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-display font-semibold text-ink">Wishlist</h1>
          <p className="text-prose text-body-lg">Вещи, которые я планирую купить.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {authenticated ? (
            <>
              <Button type="button" onClick={openCreate} disabled={pending}>
                Добавить
              </Button>
              <Button type="button" variant="secondary" onClick={handleLogout} disabled={pending}>
                Выйти
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" onClick={() => setLoginOpen(true)}>
              Редактировать
            </Button>
          )}
        </div>
      </header>

      <section>
        {items.length === 0 ? (
          <div className="border-t border-border pt-10">
            <p className="text-muted">Пока здесь пусто. Добавьте первую позицию.</p>
          </div>
        ) : (
          <div className="border-t border-border">
            {items.map((item) => {
              const wantedIndex = wantedIndexById.get(item.id) ?? -1;
              const canMove = item.status === 'wanted';

              return (
                <WishlistItemCard
                  key={item.id}
                  item={item}
                  isEditing={authenticated}
                  actions={
                    authenticated ? (
                      <>
                        <Button type="button" size="sm" variant="secondary" onClick={() => openEdit(item)}>
                          Изменить
                        </Button>
                        {canMove && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={wantedIndex <= 0 || pending}
                              onClick={() =>
                                startTransition(() => {
                                  void moveItemAction(item.id, 'up');
                                })
                              }
                            >
                              Выше
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={wantedIndex === wantedCount - 1 || pending}
                              onClick={() =>
                                startTransition(() => {
                                  void moveItemAction(item.id, 'down');
                                })
                              }
                            >
                              Ниже
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() =>
                            startTransition(() => {
                              void setItemStatusAction(
                                item.id,
                                item.status === 'bought' ? 'wanted' : 'bought',
                              );
                            })
                          }
                        >
                          {item.status === 'bought' ? 'Вернуть в список' : 'Отметить купленным'}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() => {
                            if (confirm('Удалить эту позицию?')) {
                              startTransition(() => {
                                void deleteItemAction(item.id);
                              });
                            }
                          }}
                        >
                          Удалить
                        </Button>
                      </>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование</DialogTitle>
            <DialogDescription>Введите пароль, чтобы изменять список.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {loginError && (
              <p role="alert" className="text-sm text-destructive">
                {loginError}
              </p>
            )}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                Войти
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Изменить позицию' : 'Новая позиция'}</DialogTitle>
            <DialogDescription>Заполните поля и сохраните.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Ссылка на изображение</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="price">Цена</Label>
                <Input
                  id="price"
                  type="number"
                  step="any"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Валюта</Label>
                <Select
                  value={form.currency}
                  onValueChange={(value: FormState['currency']) =>
                    setForm((prev) => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">RUB</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={form.status}
                onValueChange={(value: FormState['status']) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wanted">Хочу</SelectItem>
                  <SelectItem value="bought">Куплено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <Label>Ссылки</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      links: [...prev.links, { label: '', url: '' }],
                    }))
                  }
                >
                  Добавить ссылку
                </Button>
              </div>
              {form.links.map((link, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                  <Input
                    placeholder="Подпись"
                    value={link.label}
                    onChange={(event) =>
                      setForm((prev) => {
                        const links = [...prev.links];
                        links[index] = { ...links[index], label: event.target.value };
                        return { ...prev, links };
                      })
                    }
                  />
                  <Input
                    placeholder="https://"
                    value={link.url}
                    onChange={(event) =>
                      setForm((prev) => {
                        const links = [...prev.links];
                        links[index] = { ...links[index], url: event.target.value };
                        return { ...prev, links };
                      })
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        links: prev.links.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    Убрать
                  </Button>
                </div>
              ))}
            </div>

            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={pending}>
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
