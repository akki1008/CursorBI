import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";

const inputSchema = z.object({
  industry: z.string().min(1, "industry is required"),
  company_stage: z.string().min(1, "company_stage is required"),
  problem: z.string().min(1, "problem is required"),
});

const simulationSchema = z.object({
  company_background: z.string(),
  current_metrics: z.object({
    arr: z.number(),
    churn: z.number(),
    cac: z.number(),
  }),
  main_crisis: z.string(),
  decision_options: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        potential_impact: z.string(),
      }),
    )
    .min(2, "At least two decision options are required"),
  financial_data: z.object({
    runway_months: z.number(),
    cash_on_hand: z.number(),
    burn_rate: z.number(),
  }),
});

export type GenerateSimulationInput = z.infer<typeof inputSchema>;
export type GenerateSimulationResponse = z.infer<typeof simulationSchema>;

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsedInput = inputSchema.safeParse(json);

    if (!parsedInput.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedInput.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { industry, company_stage, problem } = parsedInput.data;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are generating structured business crisis simulations for startup hiring assessments. " +
            "Always respond with a single valid JSON object that matches the required TypeScript schema. " +
            "Use realistic, concise numbers and descriptions suitable for a 30–45 minute case exercise.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "Create a realistic business crisis simulation JSON for a startup.",
                "",
                "Input context:",
                `- Industry: ${industry}`,
                `- Company stage: ${company_stage}`,
                `- Problem to focus on: ${problem}`,
                "",
                "Respond ONLY with JSON in the following structure:",
                "",
                "{",
                '  "company_background": string,',
                '  "current_metrics": {',
                '    "arr": number,          // Annual Recurring Revenue in USD',
                '    "churn": number,        // Gross monthly revenue churn % (0-100)',
                '    "cac": number           // Average Customer Acquisition Cost in USD',
                "  },",
                '  "main_crisis": string,',
                '  "decision_options": [',
                "    {",
                '      "id": string,',
                '      "title": string,',
                '      "description": string,',
                '      "potential_impact": string',
                "    }",
                "  ],",
                '  "financial_data": {',
                '    "runway_months": number, // Cash runway in months',
                '    "cash_on_hand": number,  // Cash in USD',
                '    "burn_rate": number      // Monthly burn in USD',
                "  }",
                "}",
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawContent);
    } catch (error) {
      console.error("[generate-simulation] Failed to parse JSON", {
        error,
        rawContent,
      });
      return NextResponse.json(
        { error: "Failed to parse simulation JSON from AI response" },
        { status: 500 },
      );
    }

    const validated = simulationSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.error("[generate-simulation] Validation failed", {
        issues: validated.error.issues,
        rawContent,
      });
      return NextResponse.json(
        {
          error: "AI returned invalid simulation structure",
          details: validated.error.flatten(),
        },
        { status: 500 },
      );
    }

    return NextResponse.json(validated.data satisfies GenerateSimulationResponse);
  } catch (error) {
    console.error("[generate-simulation] Unexpected error", error);
    return NextResponse.json(
      { error: "Unexpected error while generating simulation" },
      { status: 500 },
    );
  }
}

