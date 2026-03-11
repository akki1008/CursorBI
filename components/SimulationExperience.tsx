"use client";

import { useState } from "react";
import type { SimulationScenario } from "@/lib/simulationEngine";
import { SimulationRunner } from "@/components/SimulationRunner";

type Props = {
  simulationId: string;
  scenario: SimulationScenario;
};

export function SimulationExperience({ simulationId, scenario }: Props) {
  const [candidateEmail, setCandidateEmail] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!candidateEmail.trim()) {
      setError("Please enter your email to begin the simulation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/candidate-start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          simulation_id: simulationId,
          email: candidateEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error || "Failed to register for simulation. Please try again.",
        );
      }

      const data = (await res.json()) as { attemptId: string };
      setAttemptId(data.attemptId);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unexpected error. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (attemptId) {
    // In the future we can pass attemptId into SimulationRunner to persist decisions.
    return <SimulationRunner simulationId={simulationId} scenario={scenario} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <section className="card col-span-12 bg-gradient-to-br from-slate-900/80 to-slate-800/80 lg:col-span-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-emerald-300">
              Company overview
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
              SIMULATION ID {simulationId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="pill border-indigo-400/40 bg-indigo-500/10 text-indigo-100">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Pre-brief
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-200">
          You&apos;re about to step into a live leadership scenario for a{" "}
          <span className="font-semibold text-emerald-300">
            {scenario.company_background.split(".")[0]}.
          </span>{" "}
          Read the brief and confirm your email to log your decisions to the
          founder&apos;s dashboard.
        </p>
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Crisis focus
          </p>
          <p className="mt-1">{scenario.main_crisis}</p>
        </div>
      </section>

      <section className="card col-span-12 bg-slate-950/90 lg:col-span-5">
        <h2 className="text-sm font-semibold tracking-wide text-cyan-300">
          Identify yourself
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Your email lets the founder see your run in the leaderboard. You
          won&apos;t be auto-subscribed to anything.
        </p>

        <form onSubmit={handleStart} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="candidate-email"
              className="text-xs font-medium uppercase tracking-wide text-zinc-500"
            >
              Work email
            </label>
            <input
              id="candidate-email"
              type="email"
              required
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-indigo-500/40 focus:ring-2"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400" role="status">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Preparing simulation..." : "Begin simulation"}
          </button>

          <p className="text-[11px] leading-snug text-zinc-500">
            Your responses may be shared with the hiring team for this role.
            They will not be used to train language models.
          </p>
        </form>
      </section>
    </div>
  );
}

