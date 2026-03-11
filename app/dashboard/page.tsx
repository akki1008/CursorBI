import { redirect } from "next/navigation";
import { getAuthenticatedFounder } from "@/lib/actions-auth";
import { getSupabaseClient } from "@/lib/supabase";

type DbSimulation = {
  id: string;
  industry: string | null;
  company_stage: string | null;
  problem: string | null;
};

type DbCandidateAttempt = {
  id: string;
  simulation_id: string;
  candidate_email: string;
  score: number | null;
  decisions_json: unknown;
};

type LeaderboardRow = {
  candidate_email: string;
  score: number | null;
  decision_summary: string;
};

export default async function DashboardPage() {
  const session = await getAuthenticatedFounder();

  if (!session) {
    redirect("/");
  }

  const supabase = getSupabaseClient();

  const { data: simulations, error: simsError } = await supabase
    .from("simulations")
    .select("id, industry, company_stage, problem")
    .eq("founder_id", session.founderId)
    .order("created_at", { ascending: false }) as {
    data: DbSimulation[] | null;
    error: unknown;
  };

  if (simsError) {
    console.error("[dashboard] Failed to load simulations", simsError);
  }

  if (!simulations || simulations.length === 0) {
    return (
      <div className="space-y-6">
        <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Founder dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              No simulations yet. Create your first scenario to start evaluating
              candidates.
            </p>
          </div>
          <a href="/create-simulation" className="btn-primary">
            + New simulation
          </a>
        </header>

        <div className="card bg-slate-950/80">
          <h2 className="text-sm font-semibold tracking-wide text-emerald-300">
            Getting started
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            Use the &quot;New simulation&quot; button to generate a company
            crisis tailored to your industry and stage. Then share the unique
            link with candidates and watch the leaderboard populate in real
            time.
          </p>
        </div>
      </div>
    );
  }

  const simulationIds = simulations.map((s) => s.id);

  const { data: attempts, error: attemptsError } = await supabase
    .from("candidate_attempts")
    .select("id, simulation_id, candidate_email, score, decisions_json")
    .in("simulation_id", simulationIds) as {
    data: DbCandidateAttempt[] | null;
    error: unknown;
  };

  if (attemptsError) {
    console.error("[dashboard] Failed to load candidate attempts", attemptsError);
  }

  const attemptsBySim = new Map<string, DbCandidateAttempt[]>();
  (attempts ?? []).forEach((attempt) => {
    const list = attemptsBySim.get(attempt.simulation_id) ?? [];
    list.push(attempt);
    attemptsBySim.set(attempt.simulation_id, list);
  });

  const getDecisionSummary = (decisions_json: unknown): string => {
    if (!decisions_json || typeof decisions_json !== "object") {
      return "No summary available";
    }
    // Try to pull a human-readable summary from common shapes
    const anyJson = decisions_json as any;
    if (typeof anyJson.summary === "string" && anyJson.summary.trim()) {
      return anyJson.summary;
    }
    if (Array.isArray(anyJson.rounds) && anyJson.rounds.length > 0) {
      const lastRound = anyJson.rounds[anyJson.rounds.length - 1];
      if (lastRound?.chosen_option?.title) {
        return `Ended on: ${lastRound.chosen_option.title}`;
      }
    }
    return "Decision data captured (no summary field provided)";
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Founder dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Track how candidates perform across your simulations and compare
            scores at a glance.
          </p>
        </div>
        <a href="/create-simulation" className="btn-primary">
          + New simulation
        </a>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card bg-slate-950/80">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total simulations
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {simulations.length}
          </p>
        </div>
        <div className="card bg-slate-950/80">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total candidates
          </p>
          <p className="mt-2 text-2xl font-semibold text-cyan-300">
            {attempts?.length ?? 0}
          </p>
        </div>
        <div className="card bg-slate-950/80">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Average score (all sims)
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">
            {(() => {
              const scores =
                attempts?.map((a) => a.score).filter((s): s is number => s != null) ??
                [];
              if (!scores.length) return "—";
              const avg =
                scores.reduce((sum, value) => sum + value, 0) / scores.length;
              return avg.toFixed(1);
            })()}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {simulations.map((sim) => {
          const simAttempts = attemptsBySim.get(sim.id) ?? [];
          const scores = simAttempts
            .map((a) => a.score)
            .filter((s): s is number => s != null);
          const avgScore =
            scores.length > 0
              ? (scores.reduce((sum, v) => sum + v, 0) / scores.length).toFixed(1)
              : "—";

          const leaderboard: LeaderboardRow[] = simAttempts
            .map((a) => ({
              candidate_email: a.candidate_email,
              score: a.score,
              decision_summary: getDecisionSummary(a.decisions_json),
            }))
            .sort((a, b) => {
              const sa = a.score ?? -Infinity;
              const sb = b.score ?? -Infinity;
              return sb - sa;
            });

          const displayName =
            sim.problem ||
            [sim.industry, sim.company_stage].filter(Boolean).join(" · ") ||
            "Untitled simulation";

          return (
            <section
              key={sim.id}
              className="card space-y-4 bg-slate-950/80 shadow-lg shadow-emerald-500/10"
            >
              <div className="flex flex-col gap-3 border-b border-white/5 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-emerald-300">
                    {displayName}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {sim.industry || "Unknown industry"} •{" "}
                    {sim.company_stage || "Stage N/A"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
                  <span className="pill border-white/10 bg-slate-900/80">
                    Candidates: {simAttempts.length}
                  </span>
                  <span className="pill border-amber-400/40 bg-amber-500/10 text-amber-100">
                    Avg score: {avgScore}
                  </span>
                  <a
                    href={`/simulation/${sim.id}`}
                    className="btn-secondary px-3 py-1 text-xs"
                  >
                    View simulation
                  </a>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/90">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-slate-900/80">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        <th scope="col" className="px-4 py-3">
                          Candidate
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Score
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Decision summary
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-950/60">
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-4 text-center text-xs text-zinc-500"
                          >
                            No candidate attempts yet. Share the simulation link
                            with candidates to populate the leaderboard.
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((row, idx) => (
                          <tr
                            key={`${row.candidate_email}-${idx}`}
                            className="hover:bg-slate-900/80"
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-200">
                              {row.candidate_email}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-xs">
                              {row.score != null ? (
                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                                  {row.score.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-zinc-500">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-zinc-300">
                              {row.decision_summary}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

