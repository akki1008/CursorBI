"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginOrRegister } from "@/lib/actions-auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-primary w-full justify-center"
      disabled={pending}
    >
      {pending ? "Signing you in..." : "Continue as founder"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginOrRegister, undefined);

  return (
    <form
      action={formAction}
      className="card w-full max-w-md space-y-4 bg-black/60"
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Sign in as a founder
        </h2>
        <p className="text-sm text-zinc-400">
          Use your work email. We&apos;ll keep candidates separate by scenario
          links, not by accounts.
        </p>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-xs font-medium uppercase tracking-wide text-zinc-400"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-50 outline-none ring-emerald-500/40 focus:ring-2"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-400" role="status">
          {state.error}
        </p>
      )}
      <SubmitButton />
      <p className="text-[11px] leading-snug text-zinc-500">
        We use a simple email-based login for the MVP. In production you should
        connect this to Supabase Auth or your identity provider.
      </p>
    </form>
  );
}

