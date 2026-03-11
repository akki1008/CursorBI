import { z } from "zod";
import { openai } from "@/lib/openai";
import type {
  SimulationHistoryEntry,
  SimulationDecisionOption,
  SimulationScenario,
} from "@/lib/simulationEngine";

// ---------- Types ----------

export type EvaluationInput = {
  scenario: SimulationScenario;
  history: SimulationHistoryEntry[];
  decisions: {
    round: number;
    option: SimulationDecisionOption;
    reasoning: string;
  }[];
};

export type EvaluationResult = {
  strategic_score: number;
  financial_score: number;
  risk_score: number;
  problem_solving_score: number;
  overall_score: number;
  feedback: string;
};

// Zod schema to ensure we always return a deterministic structure
const evaluationSchema = z.object({
  strategic_score: z.number().min(0).max(10),
  financial_score: z.number().min(0).max(10),
  risk_score: z.number().min(0).max(10),
  problem_solving_score: z.number().min(0).max(10),
  overall_score: z.number().min(0).max(10),
  feedback: z.string(),
});

// ---------- Core evaluation function ----------

/**
 * Evaluate candidate performance over the full simulation run.
 *
 * Dimensions:
 * - strategic thinking
 * - financial awareness
 * - risk management
 * - problem solving
 */
export async function evaluateCandidatePerformance(
  input: EvaluationInput,
): Promise<EvaluationResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          [
            "You are an expert executive coach evaluating a candidate's performance in a startup crisis simulation.",
            "You must return ONLY a single JSON object with numeric scores from 0–10 and concise written feedback.",
            "",
            "Required JSON shape:",
            "{",
            '  \"strategic_score\": number,          // 0–10',
            '  \"financial_score\": number,          // 0–10',
            '  \"risk_score\": number,               // 0–10',
            '  \"problem_solving_score\": number,    // 0–10',
            '  \"overall_score\": number,            // 0–10 (not a simple average; your holistic judgment)',
            '  \"feedback\": string                  // 2–4 short paragraphs of targeted feedback',
            "}",
          ].join("\n"),
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                scenario: input.scenario,
                rounds: input.decisions.map((d) => ({
                  round: d.round,
                  chosen_option: {
                    id: d.option.id,
                    title: d.option.title,
                    description: d.option.description,
                    potential_impact: d.option.potential_impact,
                  },
                  reasoning: d.reasoning,
                })),
                metrics_over_time: input.history.map((h) => ({
                  round: h.round,
                  updated_metrics: h.updated_metrics,
                })),
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
    console.error("[evaluation] Failed to parse AI JSON", {
      error,
      rawContent,
    });
    throw new Error("Failed to parse evaluation JSON from AI response");
  }

  const validated = evaluationSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("[evaluation] Validation failed", {
      issues: validated.error.issues,
      rawContent,
    });
    throw new Error("AI returned invalid evaluation structure");
  }

  return validated.data;
}

