import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const inputSchema = z.object({
  simulation_id: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = inputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { simulation_id, email } = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("candidate_attempts")
      .insert({
        simulation_id,
        candidate_email: email.toLowerCase(),
        decisions_json: null,
        score: null,
        feedback: null,
      })
      .select("id")
      .maybeSingle();

    if (error || !data) {
      console.error("[candidate-start] insert error", error);
      return NextResponse.json(
        { error: "Failed to register candidate for simulation." },
        { status: 500 },
      );
    }

    return NextResponse.json({ attemptId: data.id });
  } catch (error) {
    console.error("[candidate-start] Unexpected error", error);
    return NextResponse.json(
      { error: "Unexpected error while starting simulation." },
      { status: 500 },
    );
  }
}

