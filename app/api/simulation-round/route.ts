import { NextResponse } from "next/server";
import { z } from "zod";
import {
  runSimulationRound,
  type SimulationEngineInput,
  type SimulationEngineOutput,
} from "@/lib/simulationEngine";

const inputSchema = z.object({
  scenario: z.any(), // trusted to match SimulationScenario shape produced server-side
  round: z.number().int().min(1),
  candidate_decision: z.object({
    option_id: z.string().min(1),
    reasoning: z.string().min(1),
  }),
  history: z
    .array(
      z.object({
        round: z.number().int().min(1),
        chosen_option_id: z.string(),
        reasoning: z.string(),
        updated_metrics: z.object({
          arr: z.number(),
          churn: z.number(),
          cac: z.number(),
        }),
      }),
    )
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = inputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const engineInput = parsed.data as SimulationEngineInput;
    const result: SimulationEngineOutput = await runSimulationRound(engineInput);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[simulation-round] Unexpected error", error);
    return NextResponse.json(
      { error: "Unexpected error while running simulation round" },
      { status: 500 },
    );
  }
}

