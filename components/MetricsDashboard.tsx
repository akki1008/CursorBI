"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type MetricsPoint = {
  round: number;
  arr: number;
  cac: number;
  churn: number;
  runway_months: number;
};

type MetricsDashboardProps = {
  data: MetricsPoint[];
  title?: string;
};

export function MetricsDashboard({
  data,
  title = "Simulation metrics",
}: MetricsDashboardProps) {
  return (
    <section className="card bg-slate-950/80">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-cyan-300">
            {title}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Live view of how key metrics evolve across simulation rounds.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* ARR */}
        <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            ARR
          </p>
          <div className="mt-2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="round"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) =>
                    `$${Number(v).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`
                  }
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderRadius: 8,
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`,
                    "ARR",
                  ]}
                  labelFormatter={(label) => `Round ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="arr"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CAC */}
        <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            CAC
          </p>
          <div className="mt-2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="round"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) =>
                    `$${Number(v).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`
                  }
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderRadius: 8,
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}`,
                    "CAC",
                  ]}
                  labelFormatter={(label) => `Round ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="cac"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn */}
        <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Churn
          </p>
          <div className="mt-2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="round"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderRadius: 8,
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    `${Number(value).toFixed(1)}%`,
                    "Churn",
                  ]}
                  labelFormatter={(label) => `Round ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="churn"
                  stroke="#fb7185"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Runway */}
        <div className="rounded-xl border border-white/10 bg-slate-950/90 p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            Runway (months)
          </p>
          <div className="mt-2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="round"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${Number(v).toFixed(1)}`}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderRadius: 8,
                    border: "1px solid rgba(148, 163, 184, 0.4)",
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    `${Number(value).toFixed(1)} months`,
                    "Runway",
                  ]}
                  labelFormatter={(label) => `Round ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="runway_months"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

