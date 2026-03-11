import { notFound } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import type { SimulationScenario as EngineScenario } from "@/lib/simulationEngine";
import { SimulationExperience } from "@/components/SimulationExperience";

type PageParams = {
  params: {
    id: string;
  };
};

type DbSimulation = {
  id: string;
  industry: string | null;
  company_stage: string | null;
  problem: string | null;
  scenario_json: EngineScenario;
};

export default async function SimulationPage({ params }: PageParams) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("simulations")
    .select("id, industry, company_stage, problem, scenario_json")
    .eq("id", params.id)
    .maybeSingle<DbSimulation>();

  if (error) {
    console.error("[simulation page] Failed to fetch simulation", error);
    notFound();
  }

  if (!data) {
    notFound();
  }

  const scenario = data.scenario_json as EngineScenario;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Candidate simulation
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Step into the role and navigate a live company crisis. Your
            decisions will update the metrics and surface new problems in
            real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
          {data.industry && (
            <span className="pill border-white/10 bg-slate-900/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {data.industry}
            </span>
          )}
          {data.company_stage && (
            <span className="pill border-white/10 bg-slate-900/80">
              Stage: {data.company_stage}
            </span>
          )}
        </div>
      </header>

      <SimulationExperience simulationId={data.id} scenario={scenario} />
    </div>
  );
}

