"use server";

import { z } from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import {
  AuthSession,
  getCurrentSession,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth-session";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export async function getAuthenticatedFounder(): Promise<AuthSession | null> {
  return getCurrentSession();
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
}

export async function loginOrRegister(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid email" };
  }

  const { email } = parsed.data;
  const supabase = getSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from("founders")
    .select("id, email, created_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (fetchError) {
    console.error("[loginOrRegister] fetch founder error", fetchError);
    return { error: "Something went wrong while signing in. Try again." };
  }

  let founderId: string | null = (existing?.id as string | undefined) ?? null;

  if (!founderId) {
    const { data: inserted, error: insertError } = await supabase
      .from("founders")
      .insert({
        email: email.toLowerCase(),
      })
      .select("id, email, created_at")
      .maybeSingle();

    if (insertError || !inserted) {
      console.error("[loginOrRegister] insert founder error", insertError);
      return { error: "Unable to create founder account. Please try again." };
    }
    founderId = inserted.id;
  }

  if (!founderId) {
    return { error: "Unable to sign in. Please try again." };
  }

  const session: AuthSession = {
    founderId,
    email: email.toLowerCase(),
    issuedAt: Date.now(),
  };

  await setSessionCookie(session);

  return {};
}

