import { redirect } from "next/navigation";
import { getAuthenticatedFounder } from "@/lib/actions-auth";
import { LoginForm } from "@/components/LoginForm";

export default async function HomePage() {
  const session = await getAuthenticatedFounder();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-10 pt-10 sm:pt-16 lg:flex-row lg:items-center">
      <section className="flex-1 space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI-powered crisis simulations for hiring leaders
        </div>
        <div className="space-y-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            See how candidates lead when{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              everything breaks.
            </span>
          </h1>
          <p className="max-w-xl text-balance text-sm text-zinc-300 sm:text-base">
            SimuCEO creates realistic company crisis simulations powered by AI.
            Founders share a link, candidates make real decisions, and SimuCEO
            scores how they think under pressure.
          </p>
        </div>
        <div className="grid gap-4 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="card bg-zinc-900/80">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              1. Create a scenario
            </p>
            <p className="mt-1 text-sm">
              Describe your company and role. SimuCEO drafts a realistic crisis
              in your voice.
            </p>
          </div>
          <div className="card bg-zinc-900/80">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              2. Share a link
            </p>
            <p className="mt-1 text-sm">
              Send the simulation link to candidates as part of your interview
              process.
            </p>
          </div>
          <div className="card bg-zinc-900/80">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              3. Review the leaderboard
            </p>
            <p className="mt-1 text-sm">
              Compare decisions, see AI-generated consequences, and review a
              ranked list of candidates.
            </p>
          </div>
        </div>
      </section>
      <section className="flex-1">
        <LoginForm />
      </section>
    </div>
  );
}

