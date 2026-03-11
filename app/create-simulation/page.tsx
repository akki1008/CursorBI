import { redirect } from "next/navigation";
import { getAuthenticatedFounder } from "@/lib/actions-auth";
import { CreateSimulationForm } from "@/components/CreateSimulationForm";

export default async function CreateSimulationPage() {
  const session = await getAuthenticatedFounder();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 border-b border-white/10 pb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          New simulation
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Define the context and main problem you want candidates to solve.
          SimuCEO will generate a multi-round crisis scenario you can share via
          a single link.
        </p>
      </header>

      <CreateSimulationForm />
    </div>
  );
}

