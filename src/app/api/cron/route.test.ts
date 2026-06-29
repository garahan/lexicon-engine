import { GET } from "./route";

const mockSingle = jest.fn();
const mockUpdateEq = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: mockUpdateEq,
      }),
    })),
  },
}));

const CRON_SECRET = "test-cron-secret";

beforeAll(() => {
  process.env.CRON_SECRET = CRON_SECRET;
});

beforeEach(() => {
  jest.clearAllMocks();
});

function makeRequest(authHeader?: string): Request {
  const headers: Record<string, string> = {};
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }
  return new Request("http://localhost/api/cron", { headers });
}

describe("GET /api/cron", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when Authorization header is incorrect", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("returns success when profile is not found", async () => {
    mockSingle.mockResolvedValue({ data: null });

    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("does not update when streak is still active (< 24 hours)", async () => {
    const recentDate = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(); // 12 hours ago
    mockSingle.mockResolvedValue({
      data: {
        last_completed_at: recentDate,
        streak_status: "active",
        current_streak: 5,
      },
    });

    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`));
    expect(res.status).toBe(200);
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("fractures an active streak after 24 hours", async () => {
    const oldDate = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(); // 30 hours ago
    mockSingle.mockResolvedValue({
      data: {
        last_completed_at: oldDate,
        streak_status: "active",
        current_streak: 5,
      },
    });
    mockUpdateEq.mockResolvedValue({ data: null, error: null });

    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`));
    expect(res.status).toBe(200);

    // The update call should have set fractured status
    const { supabase } = jest.requireMock("@/lib/supabase");
    const fromCalls = supabase.from.mock.calls;
    // Verify update was triggered
    expect(mockUpdateEq).toHaveBeenCalled();
  });

  it("breaks a fractured streak after 48 hours", async () => {
    const veryOldDate = new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(); // 50 hours ago
    mockSingle.mockResolvedValue({
      data: {
        last_completed_at: veryOldDate,
        streak_status: "fractured",
        current_streak: 5,
      },
    });
    mockUpdateEq.mockResolvedValue({ data: null, error: null });

    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`));
    expect(res.status).toBe(200);
    expect(mockUpdateEq).toHaveBeenCalled();
  });

  it("does not double-break an already broken streak", async () => {
    const veryOldDate = new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString();
    mockSingle.mockResolvedValue({
      data: {
        last_completed_at: veryOldDate,
        streak_status: "broken",
        current_streak: 0,
      },
    });

    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`));
    expect(res.status).toBe(200);
    // Should not call update since status hasn't changed
    expect(mockUpdateEq).not.toHaveBeenCalled();
  });

  it("returns 500 when database query fails", async () => {
    mockSingle.mockRejectedValue(new Error("DB connection failed"));

    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Audit failed");
  });
});
