"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [scenarioText, setScenarioText] = useState("Loading...");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('scenarios').select('*');

      if (error) {
        console.error("Failed to load scenarios:", error.message);
        setScenarioText("Failed to load scenarios. Please try again later.");
        return;
      }

      if (data && data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        setScenarioText(random.prompt_text);
      } else {
        setScenarioText("No protocols found.");
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col h-full p-5 text-white">
      <h1 className="text-xl font-bold mb-4">Lexicon Engine</h1>
      <div className="p-4 bg-zinc-900 rounded-lg">
        <p className="text-sm">{scenarioText}</p>
      </div>
    </div>
  );
}
