"use server";

import { z } from "zod";
import { getAuthenticatedFounder } from "@/lib/actions-auth";
import { getSupabaseClient } from "@/lib/supabase";

const createSimulationSchema = z.object({
  industry: z.string().min(1, "Industry is required"),
  company_stage: z.string().min(1, "Company stage is required"),
  problem: z.string().min(1, "Main problem is required"),
});

type CreateSimulationState = {
  error?: string;
  simulationId?: string;
  shareUrl?: string;
};

export async function createSimulation(
  _prevState: CreateSimulationState | undefined,
  formData: FormData,
): Promise<CreateSimulationState> {
  const session = await getAuthenticatedFounder();
  if (!session) {
    return { error: "You must be signed in as a founder." };
  }

  const parsed = createSimulationSchema.safeParse({
    industry: formData.get("industry"),
    company_stage: formData.get("company_stage"),
    problem: formData.get("problem"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.errors[0]?.message ?? "Invalid form input",
    };
  }

  const { industry, company_stage, problem } = parsed.data;

  // Call the existing API route to generate the structured scenario
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let scenarioJson: unknown;
  try {
    const res = await fetch(`${baseUrl}/api/generate-simulation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ industry, company_stage, problem }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("[createSimulation] generate-simulation error", data);
      return {
        error: data?.error || "Failed to generate simulation scenario.",
      };
    }

    scenarioJson = await res.json();
  } catch (error) {
    console.error("[createSimulation] error calling /api/generate-simulation", error);
    return {
      error: "Unexpected error while generating simulation. Please try again.",
    };
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("simulations")
    .insert({
      founder_id: session.founderId,
      industry,
      company_stage,
      problem,
      scenario_json: scenarioJson,
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("[createSimulation] error inserting simulation", error);
    return {
      error: "Failed to save simulation. Please try again.",
    };
  }

  const shareUrl = `${baseUrl}/simulation/${data.id}`;

  return {
    simulationId: data.id,
    shareUrl,
  };
}

