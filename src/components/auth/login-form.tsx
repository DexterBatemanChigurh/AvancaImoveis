"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { signIn, type LoginState } from "@/app/login/actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">E-mail</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10 rounded-md border border-line bg-bg px-3"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10 rounded-md border border-line bg-bg px-3"
        />
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
