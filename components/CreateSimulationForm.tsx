"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createSimulation } from "@/lib/actions-simulation";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-primary w-full justify-center"
      disabled={pending}
    >
      {pending ? "Generating simulation..." : "Create simulation"}
    </button>
  );
}

export function CreateSimulationForm() {
  const [state, formAction] = useFormState(createSimulation, undefined);

  return (
    <div className="card bg-slate-950/80">
      <form className="space-y-4" action={formAction}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Create a new simulation
          </h2>
          <p className="text-sm text-zinc-400">
            Describe your company and the main problem. SimuCEO will generate a
            realistic crisis scenario candidates can step into.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="industry"
            className="text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            Industry
          </label>
          <input
            id="industry"
            name="industry"
            type="text"
            required
            placeholder="B2B SaaS, Fintech, Marketplace..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-emerald-500/40 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="company_stage"
            className="text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            Company stage
          </label>
          <input
            id="company_stage"
            name="company_stage"
            type="text"
            required
            placeholder="Seed, Series A, Bootstrapped, etc."
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-emerald-500/40 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="problem"
            className="text-xs font-medium uppercase tracking-wide text-zinc-500"
          >
            Main problem
          </label>
          <textarea
            id="problem"
            name="problem"
            rows={4}
            required
            placeholder="E.g. Enterprise churn spike after pricing change, board pressure to hit profitability within 12 months, key GTM hire underperforming..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-emerald-500/40 focus:ring-2"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-rose-400" role="status">
            {state.error}
          </p>
        )}

        <SubmitButton />
      </form>

      {state?.simulationId && state.shareUrl && (
        <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Simulation created
          </p>
          <p className="mt-1">
            Share this link with candidates to let them run the simulation:
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-lg bg-slate-950/80 px-3 py-2 text-xs">
              {state.shareUrl}
            </code>
            <a
              href={state.shareUrl}
              className="btn-secondary mt-1 w-full justify-center sm:mt-0 sm:w-auto"
            >
              Open simulation
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

