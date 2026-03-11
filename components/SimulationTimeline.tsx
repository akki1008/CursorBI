"use client";

import type {
  SimulationMetrics,
  SimulationDecisionOption,
} from "@/lib/simulationEngine";

export type SimulationTimelineEntry = {
  round: number;
  decision: {
    option: SimulationDecisionOption;
    reasoning: string;
  };
  consequences: {
    updatedMetrics: SimulationMetrics;
    newProblems: string[];
  };
};

type SimulationTimelineProps = {
  entries: SimulationTimelineEntry[];
  maxRounds?: number;
};

export function SimulationTimeline({
  entries,
  maxRounds = 3,
}: SimulationTimelineProps) {
  if (!entries.length) {
    return (
      <section className="card bg-slate-950/80">
        <h2 className="text-sm font-semibold tracking-wide text-cyan-300">
          Simulation timeline
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          As you commit decisions, each round&apos;s choices and consequences
          will appear here in a vertical timeline.
        </p>
      </section>
    );
  }

  return (
    <section className="card bg-slate-950/80">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-cyan-300">
            Simulation timeline
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Product-strategy view of how each decision changed the business.
          </p>
        </div>
        <div className="pill border-cyan-400/40 bg-cyan-500/10 text-cyan-100">
          {entries.length} / {maxRounds} rounds logged
        </div>
      </div>

      <ol className="mt-4 space-y-4 border-l border-dashed border-zinc-700 pl-4">
        {entries.map((entry) => (
          <li key={entry.round} className="relative space-y-2">
            {/* timeline node */}
            <span className="absolute -left-[10px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            </span>

            {/* round label */}
            <div className="inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
              Round {entry.round} decision
            </div>

            {/* decision card */}
            <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Decision
              </p>
              <p className="mt-1 font-semibold text-zinc-50">
                {entry.decision.option.title}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {entry.decision.option.description}
              </p>
              <p className="mt-2 text-xs text-emerald-300">
                Impact: {entry.decision.option.potential_impact}
              </p>
              <p className="mt-2 text-xs text-zinc-300">
                <span className="font-semibold text-zinc-400">
                  Candidate reasoning:
                </span>{" "}
                {entry.decision.reasoning}
              </p>
            </div>

            {/* consequences label */}
            <div className="inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
              Round {entry.round} consequences
            </div>

            {/* consequences card */}
            <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Metrics shift
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-300">
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5">
                  ARR: $
                  {entry.consequences.updatedMetrics.arr.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 0 },
                  )}
                </span>
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5">
                  Churn: {entry.consequences.updatedMetrics.churn.toFixed(1)}%
                </span>
                <span className="rounded-full bg-slate-900/80 px-2 py-0.5">
                  CAC: $
                  {entry.consequences.updatedMetrics.cac.toLocaleString(
                    undefined,
                    { maximumFractionDigits: 0 },
                  )}
                </span>
              </div>

              {entry.consequences.newProblems.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                    New problems surfaced
                  </p>
                  <ul className="list-disc pl-5 text-xs text-amber-100">
                    {entry.consequences.newProblems.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

