"use client";

import { useState } from "react";
import { Flame, Activity } from "lucide-react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This function will eventually send the text to the Gemini API
  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsSubmitting(true);
    
    // Simulating network delay for now
    setTimeout(() => {
      setIsSubmitting(false);
      alert("API endpoint connection coming in the next step!");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full p-5 flex-grow">
      {/* Header: Status and Streak Tracker */}
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

      {/* The Daily Prompt Card */}
      <div className="mt-8 p-5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-corporate-accent/5 rounded-full blur-3xl"></div>
        
        <div className="flex justify-between items-start mb-3 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-corporate-accent">Daily Protocol</span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Track A: Diagnostics</span>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300 relative z-10">
          A flagship device is experiencing anomalous kernel panics under specific software loads. Draft a concise executive summary for the engineering team detailing the diagnostic steps required to isolate the logic board.
        </p>
      </div>

      {/* The Input Workspace */}
      <div className="mt-6 flex-grow flex flex-col relative group">
        <textarea
          className="flex-grow w-full bg-transparent border-none resize-none text-[15px] leading-relaxed outline-none placeholder:text-zinc-700 p-2 text-zinc-200 transition-all focus:placeholder:text-zinc-800"
          placeholder="Tap to begin drafting your response..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          spellCheck="false"
        />
      </div>

      {/* The Action Bar */}
      <div className="py-4 mt-auto border-t border-zinc-800/80 bg-black pt-4">
        <button
          onClick={handleAnalyze}
          disabled={isSubmitting || !inputText.trim()}
          className="w-full py-4 rounded-xl bg-zinc-100 text-black font-bold text-sm tracking-widest disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
        >
          {isSubmitting ? (
            <span className="animate-pulse">ANALYZING SYNTAX...</span>
          ) : (
            "SUBMIT FOR REVIEW"
          )}
        </button>
      </div>
    </div>
  );
}
