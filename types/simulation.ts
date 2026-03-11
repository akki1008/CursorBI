export type Founder = {
  id: string;
  email: string;
  created_at: string;
};

export type SimulationScenario = {
  id: string;
  founder_id: string;
  title: string;
  role: string;
  company_context: string;
  crisis_brief: string;
  evaluation_rubric: string;
  share_id: string;
  created_at: string;
};

export type TranscriptMessageRole = "system" | "ai" | "candidate";

export type TranscriptMessage = {
  role: TranscriptMessageRole;
  content: string;
  created_at: string;
};

export type SimulationSession = {
  id: string;
  scenario_id: string;
  candidate_name: string;
  transcript: TranscriptMessage[];
  score: number | null;
  evaluation_summary: string | null;
  completed: boolean;
  created_at: string;
};

