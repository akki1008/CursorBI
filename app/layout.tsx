import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimuCEO",
  description:
    "AI-powered business simulations that help founders evaluate candidates in realistic company crises.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full bg-zinc-950 text-zinc-50 antialiased`}
      >
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1e293b_0,_#020617_45%,_#000_100%)] text-zinc-50">
          <header className="border-b border-white/10 bg-black/30 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                  SC
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    SimuCEO
                  </p>
                  <p className="text-xs text-zinc-400">
                    Crisis simulations for serious hires
                  </p>
                </div>
              </div>
              <nav className="flex items-center gap-3 text-sm text-zinc-300">
                <a
                  href="/dashboard"
                  className="rounded-full px-3 py-1 transition hover:bg-zinc-800/70"
                >
                  Dashboard
                </a>
                <a
                  href="/create-simulation"
                  className="hidden rounded-full px-3 py-1 text-emerald-300 ring-1 ring-emerald-500/40 transition hover:bg-emerald-500/10 hover:text-emerald-200 sm:inline-flex"
                >
                  New simulation
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

