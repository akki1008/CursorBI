"use client";

import { useState } from "react";
import type {
  SimulationScenario,
  SimulationMetrics,
  SimulationDecisionOption,
  SimulationEngineOutput,
  SimulationHistoryEntry,
} from "@/lib/simulationEngine";

type Props = {
  simulationId: string;
  scenario: SimulationScenario;
};

type TimelineEntry = {
  round: number;
  optionTitle: string;
  reasoning: string;
  updatedMetrics: SimulationMetrics;
  newProblems: string[];
};

export function SimulationRunner({ simulationId, scenario }: Props) {
  const [currentRound, setCurrentRound] = useState(1);
  const [metrics, setMetrics] = useState<SimulationMetrics>(
    scenario.current_metrics,
  );
  const [decisionOptions, setDecisionOptions] = useState<
    SimulationDecisionOption[]
  >(scenario.decision_options);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinalRound, setIsFinalRound] = useState(false);

  const maxRounds = 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedOptionId) {
      setError("Please choose a decision option.");
      return;
    }
    if (!reasoning.trim()) {
      setError("Please explain your reasoning.");
      return;
    }

    setIsSubmitting(true);
    try {
      const historyPayload: SimulationHistoryEntry[] = timeline.map((entry) => ({
        round: entry.round,
        chosen_option_id: "", // not used by engine for previous rounds in this MVP
        reasoning: entry.reasoning,
        updated_metrics: entry.updatedMetrics,
      }));

      const res = await fetch("/api/simulation-round", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: {
            ...scenario,
            current_metrics: metrics,
            decision_options: decisionOptions,
          },
          round: currentRound,
          candidate_decision: {
            option_id: selectedOptionId,
            reasoning,
          },
          history: historyPayload,
          simulation_id: simulationId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error || "Failed to run simulation. Please try again.",
        );
      }

      const data: SimulationEngineOutput = await res.json();

      const chosenOption =
        decisionOptions.find((opt) => opt.id === selectedOptionId) ??
        decisionOptions[0];

      const newEntry: TimelineEntry = {
        round: currentRound,
        optionTitle: chosenOption?.title ?? "Chosen option",
        reasoning,
        updatedMetrics: data.updated_metrics,
        newProblems: data.new_problems,
      };

      setTimeline((prev) => [...prev, newEntry]);
      setMetrics(data.updated_metrics);
      setDecisionOptions(data.next_decision_options);
      setReasoning("");
      setSelectedOptionId(null);
      setIsFinalRound(data.is_final_round);

      if (!data.is_final_round && currentRound < maxRounds) {
        setCurrentRound((r) => r + 1);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error occurred. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* Company overview */}
      <section className="card col-span-12 bg-gradient-to-br from-slate-900/80 to-slate-800/80 lg:col-span-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-emerald-300">
              Company overview
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
              SIMULATION ID {simulationId.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="pill border-emerald-400/40 bg-emerald-500/10 text-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Round {currentRound} of {maxRounds}
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-200">
          {scenario.company_background}
        </p>
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Current crisis
          </p>
          <p className="mt-1">{scenario.main_crisis}</p>
        </div>
      </section>

      {/* Metrics panel */}
      <section className="card col-span-12 bg-slate-950/80 lg:col-span-3">
        <h2 className="text-sm font-semibold tracking-wide text-cyan-300">
          Metrics panel
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Live telemetry of the company state.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              ARR
            </p>
            <p className="mt-1 text-lg font-semibold text-emerald-300">
              $
              {metrics.arr.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Churn
            </p>
            <p className="mt-1 text-lg font-semibold text-rose-300">
              {metrics.churn.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              CAC
            </p>
            <p className="mt-1 text-lg font-semibold text-cyan-300">
              $
              {metrics.cac.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Decision panel */}
      <section className="card col-span-12 bg-slate-950/90 lg:col-span-4">
        <h2 className="text-sm font-semibold tracking-wide text-emerald-300">
          Decision panel
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Choose a path and explain how you&apos;d execute it.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Available options
            </p>
            <div className="space-y-2">
              {decisionOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOptionId(option.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedOptionId === option.id
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-white/10 bg-slate-900/70 hover:border-emerald-500/40 hover:bg-slate-900"
                  }`}
                  disabled={isSubmitting || isFinalRound}
                >
                  <p className="font-semibold text-zinc-50">{option.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {option.description}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-300">
                    Impact: {option.potential_impact}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="reasoning"
              className="text-xs font-medium uppercase tracking-wide text-zinc-500"
            >
              Explain your reasoning
            </label>
            <textarea
              id="reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Walk the board through how you would execute this decision over the next 90 days..."
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-zinc-50 outline-none ring-emerald-500/40 focus:ring-2 disabled:opacity-60"
              disabled={isSubmitting || isFinalRound}
            />
          </div>

          {error && (
            <p className="text-sm text-rose-400" role="status">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-zinc-500">
              This simulation runs for up to {maxRounds} rounds.
            </p>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || isFinalRound}
            >
              {isFinalRound
                ? "Simulation complete"
                : isSubmitting
                  ? "Computing consequences..."
                  : currentRound === 1
                    ? "Commit decision"
                    : "Advance to next round"}
            </button>
          </div>
        </form>
      </section>

      {/* Simulation timeline */}
      <section className="card col-span-12 bg-slate-950/80">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-cyan-300">
              Simulation timeline
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Command center log of your decisions and how the company evolved.
            </p>
          </div>
          <div className="pill border-cyan-400/40 bg-cyan-500/10 text-cyan-100">
            {timeline.length === 0
              ? "Awaiting first decision"
              : `${timeline.length} / ${maxRounds} rounds logged`}
          </div>
        </div>

        {timeline.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            As you submit decisions, each round will appear here with metric
            changes and newly surfaced problems.
          </p>
        ) : (
          <ol className="mt-4 space-y-3 text-sm">
            {timeline.map((entry) => (
              <li
                key={entry.round}
                className="flex gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-3"
              >
                <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-emerald-500/10 text-center text-xs font-semibold leading-7 text-emerald-300 ring-1 ring-emerald-500/40">
                  R{entry.round}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-zinc-50">
                      {entry.optionTitle}
                    </p>
                    <div className="flex gap-2 text-[11px] text-zinc-400">
                      <span>
                        ARR: $
                        {entry.updatedMetrics.arr.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                      <span>• Churn: {entry.updatedMetrics.churn.toFixed(1)}%</span>
                      <span>
                        • CAC: $
                        {entry.updatedMetrics.cac.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300">
                    <span className="font-semibold text-zinc-400">
                      Your reasoning:
                    </span>{" "}
                    {entry.reasoning}
                  </p>
                  {entry.newProblems.length > 0 && (
                    <div className="mt-1 space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                        New problems surfaced
                      </p>
                      <ul className="list-disc pl-5 text-xs text-amber-100">
                        {entry.newProblems.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

