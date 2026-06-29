"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { EvaluationResult } from "@/lib/ai";

interface Scenario {
  id: string;
  track_name?: string;
  prompt_text: string;
}

interface EvaluationResponse extends EvaluationResult {
  new_elo?: number;
  new_streak?: number;
}

export default function Home() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">(
    "loading"
  );
  const [loadError, setLoadError] = useState("");

  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [submitError, setSubmitError] = useState("");

  const pickRandom = useCallback((list: Scenario[]) => {
    const next = list[Math.floor(Math.random() * list.length)];
    setScenario(next);
    setResult(null);
    setResponse("");
    setSubmitError("");
  }, []);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("scenarios").select("*");

      if (error) {
        console.error("Failed to load scenarios:", error);
        setLoadError(error.message);
        setStatus("error");
        return;
      }

      if (data && data.length > 0) {
        setScenarios(data as Scenario[]);
        pickRandom(data as Scenario[]);
        setStatus("ready");
      } else {
        setStatus("empty");
      }
    }
    load();
  }, [pickRandom]);

  async function handleSubmit() {
    if (!scenario || !response.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: response,
          scenario: scenario.prompt_text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data?.error || "Evaluation failed. Please try again.");
        return;
      }

      setResult(data as EvaluationResponse);
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full p-5 text-corporate-light gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Lexicon Engine</h1>
        {result?.new_elo !== undefined && (
          <div className="text-right text-xs text-zinc-400">
            <div>
              Elo <span className="text-corporate-accent font-semibold">{result.new_elo}</span>
            </div>
            <div>
              Streak <span className="text-corporate-warning font-semibold">{result.new_streak}</span>
            </div>
          </div>
        )}
      </header>

      {status === "loading" && (
        <div className="p-4 bg-zinc-900 rounded-lg text-sm text-zinc-400">
          Loading protocol…
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-950 border border-red-800 rounded-lg text-sm text-red-300">
          Connection error: {loadError}
        </div>
      )}

      {status === "empty" && (
        <div className="p-4 bg-zinc-900 rounded-lg text-sm text-zinc-400">
          No protocols found.
        </div>
      )}

      {status === "ready" && scenario && (
        <>
          <div className="p-4 bg-zinc-900 rounded-lg">
            {scenario.track_name && (
              <p className="text-xs uppercase tracking-wide text-corporate-accent mb-1">
                {scenario.track_name}
              </p>
            )}
            <p className="text-sm leading-relaxed">{scenario.prompt_text}</p>
          </div>

          <textarea
            aria-label="Your response"
            className="w-full min-h-32 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-corporate-accent resize-y"
            placeholder="Draft your executive-level response…"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={submitting}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !response.trim()}
              className="flex-1 py-2.5 rounded-lg bg-corporate-accent text-black font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Analyzing…" : "Submit for Evaluation"}
            </button>
            <button
              onClick={() => pickRandom(scenarios)}
              disabled={submitting}
              className="px-4 py-2.5 rounded-lg border border-zinc-700 text-sm text-zinc-300 disabled:opacity-40"
            >
              New Scenario
            </button>
          </div>

          {submitError && (
            <div className="p-3 bg-red-950 border border-red-800 rounded-lg text-sm text-red-300">
              {submitError}
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-zinc-900 rounded-lg">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs uppercase tracking-wide text-zinc-400">
                    Score
                  </span>
                  <span className="text-2xl font-bold text-corporate-accent">
                    {result.score}
                    <span className="text-sm text-zinc-500">/100</span>
                  </span>
                </div>
                <p className="text-sm text-corporate-warning italic">
                  {result.feedback}
                </p>
              </div>

              {result.upgraded_text && (
                <div className="p-4 bg-zinc-900 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">
                    C2 Rewrite
                  </p>
                  <p className="text-sm leading-relaxed">{result.upgraded_text}</p>
                </div>
              )}

              {result.replaced_words && result.replaced_words.length > 0 && (
                <div className="p-4 bg-zinc-900 rounded-lg">
                  <p className="text-xs uppercase tracking-wide text-zinc-400 mb-2">
                    Vocabulary Upgrades
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {result.replaced_words.map((w, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="text-zinc-500 line-through">{w.basic}</span>
                        <span className="text-zinc-600">→</span>
                        <span className="syntax-glow-success">{w.advanced}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
