'use client';

import { useState, useTransition } from 'react';

import { loginAction, logoutAction } from '@/lib/auth-actions';
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

type AuthControlsProps = {
  authenticated: boolean;
};

export function AuthControls({ authenticated }: AuthControlsProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginAction(password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPassword('');
      setOpen(false);
    });
  }

  if (authenticated) {
    return (
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() => startTransition(() => { void logoutAction(); })}
      >
        Выйти
      </Button>
    );
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Редактировать
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                Войти
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
