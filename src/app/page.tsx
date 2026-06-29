"use client";

import { useState } from "react";
import { Flame, Activity, Crosshair, ArrowRight } from "lucide-react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const scenarioText = "A flagship device is experiencing anomalous kernel panics under specific software loads. Draft a concise executive summary for the engineering team detailing the diagnostic steps required to isolate the logic board.";

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          scenario: scenarioText
        }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Evaluation failed:", error);
      alert("System error: Unable to connect to evaluation core.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProtocol = () => {
    setResult(null);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full p-5 flex-grow">
      {/* Header */}
      <header className="flex justify-between items-start py-2 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Lexicon</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium tracking-wide">ELO: 1200 | SPECIALIST</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-corporate-accent flex items-center gap-1.5 uppercase tracking-wider">
            <Activity size={14} className="animate-pulse" />
            Active
          </span>
          <span className="text-sm text-zinc-400 mt-1 flex items-center gap-1 font-medium">
            <Flame size={14} className="text-zinc-500" />
            14 Days
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      {!result ? (
        <>
          {/* Prompt Card */}
          <div className="mt-8 p-5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-corporate-accent/5 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-corporate-accent">Daily Protocol</span>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Track A: Diagnostics</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300 relative z-10">{scenarioText}</p>
          </div>

          {/* Input Workspace */}
          <div className="mt-6 flex-grow flex flex-col relative group">
            <textarea
              className="flex-grow w-full bg-transparent border-none resize-none text-[15px] leading-relaxed outline-none placeholder:text-zinc-700 p-2 text-zinc-200 transition-all focus:placeholder:text-zinc-500"
              placeholder="Tap to begin drafting your response..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              spellCheck="false"
            />
          </div>

          {/* Action Bar */}
          <div className="py-4 mt-auto border-t border-zinc-800/80 bg-black pt-4">
            <button
              onClick={handleAnalyze}
              disabled={isSubmitting || !inputText.trim()}
              className="w-full py-4 rounded-xl bg-zinc-100 text-black font-bold text-sm tracking-widest disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {isSubmitting ? <span className="animate-pulse">ANALYZING SYNTAX...</span> : "SUBMIT FOR REVIEW"}
            </button>
          </div>
        </>
      ) : (
        /* Evaluation Dashboard (Shows after API returns data) */
        <div className="flex-grow flex flex-col mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Score & Feedback */}
          <div className="flex items-center gap-5 mb-6">
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-corporate-accent/30 bg-corporate-accent/10">
              <span className="text-2xl font-black text-corporate-accent syntax-glow-success">{result.score}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Executive Feedback</h2>
              <p className="text-sm text-zinc-300 italic">"{result.feedback}"</p>
            </div>
          </div>

          {/* Vocabulary Upgrades */}
          {result.replaced_words && result.replaced_words.length > 0 && (
            <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3 flex items-center gap-2">
                <Crosshair size={12} /> Lexical Upgrades
              </h3>
              <div className="flex flex-col gap-3">
                {result.replaced_words.map((wordObj: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 line-through decoration-red-500/50">{wordObj.basic}</span>
                    <ArrowRight size={14} className="text-zinc-700" />
                    <span className="font-bold syntax-glow-success">{wordObj.advanced}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C2 Upgraded Text */}
          <div className="mb-8">
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">C2 Target Output</h3>
            <div className="p-4 bg-black border border-zinc-800 rounded-xl">
              <p className="text-sm leading-relaxed text-zinc-200">{result.upgraded_text}</p>
            </div>
          </div>

          {/* Next Action */}
          <div className="mt-auto border-t border-zinc-800/80 pt-4">
            <button
              onClick={resetProtocol}
              className="w-full py-4 rounded-xl bg-transparent border border-zinc-700 text-zinc-300 font-bold text-sm tracking-widest transition-all active:scale-[0.98] active:bg-zinc-900"
            >
              NEXT PROTOCOL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
