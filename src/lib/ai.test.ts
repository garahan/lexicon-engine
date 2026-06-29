import {
  cleanAiResponse,
  parseAiResponse,
  buildEvaluationPrompt,
  mapToVocabInserts,
} from "./ai";

describe("cleanAiResponse", () => {
  it("strips ```json and ``` fences from response", () => {
    const raw = '```json\n{"score": 75}\n```';
    expect(cleanAiResponse(raw)).toBe('{"score": 75}');
  });

  it("strips only ``` fences (no json tag)", () => {
    const raw = '```\n{"score": 75}\n```';
    expect(cleanAiResponse(raw)).toBe('{"score": 75}');
  });

  it("trims surrounding whitespace", () => {
    const raw = '  \n {"score": 75}  \n ';
    expect(cleanAiResponse(raw)).toBe('{"score": 75}');
  });

  it("returns already-clean JSON unchanged (after trim)", () => {
    const raw = '{"score": 75}';
    expect(cleanAiResponse(raw)).toBe('{"score": 75}');
  });

  it("handles multiple code block markers", () => {
    const raw = '```json\n```json\n{"score": 75}\n```\n```';
    const cleaned = cleanAiResponse(raw);
    expect(cleaned).not.toContain("```");
  });
});

describe("parseAiResponse", () => {
  const validResponse = JSON.stringify({
    score: 82,
    upgraded_text: "The implementation rectifies the underlying deficiency.",
    replaced_words: [
      { basic: "fix", advanced: "rectify" },
      { basic: "problem", advanced: "deficiency" },
    ],
    feedback: "Excessive reliance on colloquial phrasing undermines authority.",
  });

  it("parses clean JSON correctly", () => {
    const result = parseAiResponse(validResponse);
    expect(result.score).toBe(82);
    expect(result.upgraded_text).toContain("rectifies");
    expect(result.replaced_words).toHaveLength(2);
    expect(result.feedback).toBeDefined();
  });

  it("parses JSON wrapped in markdown fences", () => {
    const wrapped = "```json\n" + validResponse + "\n```";
    const result = parseAiResponse(wrapped);
    expect(result.score).toBe(82);
    expect(result.replaced_words).toHaveLength(2);
  });

  it("throws on malformed JSON", () => {
    expect(() => parseAiResponse("not json at all")).toThrow();
  });

  it("throws on empty string", () => {
    expect(() => parseAiResponse("")).toThrow();
  });

  it("handles JSON with extra whitespace around fences", () => {
    const padded = "  ```json  \n" + validResponse + "\n  ```  ";
    const result = parseAiResponse(padded);
    expect(result.score).toBe(82);
  });
});

describe("buildEvaluationPrompt", () => {
  it("includes the scenario in the prompt", () => {
    const prompt = buildEvaluationPrompt("server outage", "I will fix the server");
    expect(prompt).toContain("server outage");
  });

  it("includes the user's text in the prompt", () => {
    const prompt = buildEvaluationPrompt("server outage", "I will fix the server");
    expect(prompt).toContain("I will fix the server");
  });

  it("includes JSON structure instructions", () => {
    const prompt = buildEvaluationPrompt("test", "test");
    expect(prompt).toContain('"score"');
    expect(prompt).toContain('"upgraded_text"');
    expect(prompt).toContain('"replaced_words"');
    expect(prompt).toContain('"feedback"');
  });

  it("requests C2-level evaluation", () => {
    const prompt = buildEvaluationPrompt("test", "test");
    expect(prompt).toContain("C2-level");
  });
});

describe("mapToVocabInserts", () => {
  it("maps replaced words to vocab insert format", () => {
    const words = [
      { basic: "fix", advanced: "rectify" },
      { basic: "look at", advanced: "investigate" },
    ];
    const inserts = mapToVocabInserts(words);

    expect(inserts).toEqual([
      { basic_word: "fix", c2_upgrade: "rectify" },
      { basic_word: "look at", c2_upgrade: "investigate" },
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(mapToVocabInserts([])).toEqual([]);
  });

  it("handles single word", () => {
    const words = [{ basic: "use", advanced: "utilize" }];
    const inserts = mapToVocabInserts(words);
    expect(inserts).toHaveLength(1);
    expect(inserts[0].basic_word).toBe("use");
    expect(inserts[0].c2_upgrade).toBe("utilize");
  });
});
