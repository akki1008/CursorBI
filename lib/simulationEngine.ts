import { z } from "zod";
import { openai } from "@/lib/openai";

// Core scenario & metrics types kept intentionally simple and stable
// so the frontend can rely on a deterministic structure.

export type SimulationMetrics = {
  arr: number; // Annual Recurring Revenue (USD)
  churn: number; // Monthly gross revenue churn % (0-100)
  cac: number; // Customer Acquisition Cost (USD)
};

export type SimulationDecisionOption = {
  id: string;
  title: string;
  description: string;
  potential_impact: string;
};

export type SimulationScenario = {
  company_background: string;
  current_metrics: SimulationMetrics;
  main_crisis: string;
  decision_options: SimulationDecisionOption[];
  financial_data: {
    runway_months: number;
    cash_on_hand: number;
    burn_rate: number;
  };
};

export type SimulationHistoryEntry = {
  round: number;
  chosen_option_id: string;
  reasoning: string;
  updated_metrics: SimulationMetrics;
};

export type SimulationEngineInput = {
  scenario: SimulationScenario;
  round: number; // 1–3
  candidate_decision: {
    option_id: string;
    reasoning: string;
  };
  history?: SimulationHistoryEntry[];
};

export type SimulationEngineOutput = {
  round: number;
  maxRounds: number;
  is_final_round: boolean;
  updated_metrics: SimulationMetrics;
  new_problems: string[];
  next_decision_options: SimulationDecisionOption[];
};

const MAX_ROUNDS = 3;

// Zod schema to validate the OpenAI response so that the frontend
// always receives a deterministic structure.
const aiResponseSchema = z.object({
  updated_metrics: z.object({
    arr: z.number(),
    churn: z.number(),
    cac: z.number(),
  }),
  new_problems: z.array(z.string()),
  next_decision_options: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      potential_impact: z.string(),
    }),
  ),
});

export type RawAiSimulationResponse = z.infer<typeof aiResponseSchema>;

/**
 * Runs a single simulation round (up to 3) by sending the scenario,
 * candidate decision, and prior history to OpenAI and returns a
 * deterministic, validated structure that the frontend can render.
 */
export async function runSimulationRound(
  input: SimulationEngineInput,
): Promise<SimulationEngineOutput> {
  const round = Math.min(Math.max(1, input.round), MAX_ROUNDS);
  const isFinal = round >= MAX_ROUNDS;

  const history = input.history ?? [];

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          [
            "You are a simulation engine for founder hiring assessments.",
            "You receive:",
            "- A startup scenario (background, metrics, financials, crisis, options).",
            "- The candidate's chosen option and reasoning for the CURRENT round.",
            "- A short history of previous rounds (if any).",
            "",
            "You must return ONLY a single JSON object with the following shape:",
            "",
            "{",
            '  \"updated_metrics\": {',
            '    \"arr\": number,   // Annual Recurring Revenue in USD',
            '    \"churn\": number, // Monthly gross revenue churn % (0-100)',
            '    \"cac\": number    // Customer Acquisition Cost in USD',
            "  },",
            '  \"new_problems\": string[],',
            '  \"next_decision_options\": [',
            "    {",
            '      \"id\": string,',
            '      \"title\": string,',
            '      \"description\": string,',
            '      \"potential_impact\": string',
            "    }",
            "  ]",
            "}",
            "",
            "Constraints:",
            "- The simulation lasts exactly 3 rounds in total.",
            "- Make the metrics adjustments realistic and consistent between rounds.",
            "- If this is the final round, you may still provide decision options,",
            "  but they will be used only for qualitative discussion, not further rounds.",
          ].join("\n"),
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                round,
                maxRounds: MAX_ROUNDS,
                scenario: input.scenario,
                candidate_decision: input.candidate_decision,
                previous_rounds: history,
              },
              null,
              2,
            ),
          },
        ],
      },
    ],
  });

  const rawContent = completion.choices[0]?.message?.content ?? "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch (error) {
    console.error("[simulationEngine] Failed to parse AI JSON", {
      error,
      rawContent,
    });
    throw new Error("Failed to parse simulation engine response from AI");
  }

  const validated = aiResponseSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("[simulationEngine] Validation failed", {
      issues: validated.error.issues,
      rawContent,
    });
    throw new Error("AI returned invalid simulation engine structure");
  }

  const { updated_metrics, new_problems, next_decision_options } =
    validated.data;

  const output: SimulationEngineOutput = {
    round,
    maxRounds: MAX_ROUNDS,
    is_final_round: isFinal,
    updated_metrics,
    new_problems,
    next_decision_options,
  };

  return output;
}

