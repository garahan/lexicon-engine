// Mock supabase
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateEq = jest.fn();
const mockInsert = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === "profiles") {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              single: mockSingle,
            }),
          }),
          update: mockUpdate.mockReturnValue({
            eq: mockUpdateEq,
          }),
        };
      }
      if (table === "vocabulary") {
        return { insert: mockInsert };
      }
      return {};
    }),
  },
}));

// Mock Google Generative AI — use a stable reference via module variable
const mockGenerateContent = jest.fn();
jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: (...args: unknown[]) => mockGenerateContent(...args),
      }),
    })),
  };
});

// Import after mocks are defined
import { POST } from "./route";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/evaluate", () => {
  it("returns 400 when no text is provided", async () => {
    const res = await POST(makeRequest({ text: "", scenario: "test" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("No text provided");
  });

  it("evaluates text and returns parsed AI response with profile update", async () => {
    const aiResult = {
      score: 80,
      upgraded_text: "Upgraded corporate text.",
      replaced_words: [{ basic: "fix", advanced: "rectify" }],
      feedback: "Adequate but lacking precision.",
    };

    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(aiResult) },
    });

    mockSingle.mockResolvedValue({
      data: { elo_rating: 1200, current_streak: 5, max_streak: 10, user_name: "Admin" },
    });
    mockUpdateEq.mockResolvedValue({ data: null, error: null });
    mockInsert.mockResolvedValue({ data: null, error: null });

    const res = await POST(makeRequest({ text: "I will fix the server", scenario: "outage" }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.score).toBe(80);
    expect(body.new_elo).toBe(1208); // 1200 + floor(80/10)
    expect(body.new_streak).toBe(6);
    expect(body.replaced_words).toHaveLength(1);
  });

  it("handles AI response wrapped in markdown fences", async () => {
    const aiResult = {
      score: 60,
      upgraded_text: "Corporate rewrite.",
      replaced_words: [],
      feedback: "Subpar.",
    };

    mockGenerateContent.mockResolvedValue({
      response: { text: () => "```json\n" + JSON.stringify(aiResult) + "\n```" },
    });

    mockSingle.mockResolvedValue({ data: null }); // no profile

    const res = await POST(makeRequest({ text: "some text", scenario: "test" }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.score).toBe(60);
    // No profile → no new_elo or new_streak
    expect(body.new_elo).toBeUndefined();
  });

  it("skips vocabulary insert when replaced_words is empty", async () => {
    const aiResult = {
      score: 90,
      upgraded_text: "Excellent text.",
      replaced_words: [],
      feedback: "Well done.",
    };

    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(aiResult) },
    });
    mockSingle.mockResolvedValue({ data: null });

    await POST(makeRequest({ text: "a good response", scenario: "test" }));
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("inserts vocabulary when replaced_words is non-empty", async () => {
    const aiResult = {
      score: 70,
      upgraded_text: "Rewritten text.",
      replaced_words: [
        { basic: "fix", advanced: "rectify" },
        { basic: "problem", advanced: "deficiency" },
      ],
      feedback: "Needs work.",
    };

    mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(aiResult) },
    });
    mockSingle.mockResolvedValue({ data: null });
    mockInsert.mockResolvedValue({ data: null, error: null });

    await POST(makeRequest({ text: "fix the problem", scenario: "test" }));
    expect(mockInsert).toHaveBeenCalledWith([
      { basic_word: "fix", c2_upgrade: "rectify" },
      { basic_word: "problem", c2_upgrade: "deficiency" },
    ]);
  });

  it("returns 500 when AI generation fails", async () => {
    mockGenerateContent.mockRejectedValue(new Error("API key invalid"));

    const res = await POST(makeRequest({ text: "test", scenario: "test" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Failed to analyze");
  });
});
