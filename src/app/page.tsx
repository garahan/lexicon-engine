const fetchRandomScenario = async () => {
    setScenarioText("Decrypting next protocol...");
    try {
      const { data, error } = await supabase.from('scenarios').select('*');
      
      if (error) {
        console.error("Supabase Error:", error);
        setScenarioText("Error loading protocols. Check Supabase RLS settings.");
        return;
      }

      if (data && data.length > 0) {
        const randomPrompt = data[Math.floor(Math.random() * data.length)];
        setScenarioText(randomPrompt.prompt_text);
        setTrackName(randomPrompt.track_name);
      } else {
        setScenarioText("No protocols found in database.");
      }
    } catch (e) {
      setScenarioText("Connection failed.");
    }
  };

  useEffect(() => {
    async function loadStats() {
      // We use a safe query
      const { data, error } = await supabase.from('profiles').select('*').eq('user_name', 'Admin').single();
      if (data) {
        setElo(data.elo_rating);
        setStreak(data.current_streak);
        setStatus(data.streak_status);
      }
    }
    loadStats();
    // Delay the scenario fetch slightly to ensure DB connection is warm
    setTimeout(fetchRandomScenario, 1000); 
  }, []);
