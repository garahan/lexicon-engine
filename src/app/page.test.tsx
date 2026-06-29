import "@testing-library/jest-dom";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const mockSelect = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: () => ({
      select: (...args: unknown[]) => mockSelect(...args),
    }),
  },
}));

import Home from "./page";

describe("Home page", () => {
  beforeEach(() => {
    mockSelect.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore?.();
    jest.restoreAllMocks();
  });

  it("renders a scenario prompt when data is returned", async () => {
    mockSelect.mockResolvedValue({
      data: [{ id: "1", prompt_text: "Draft a board brief." }],
      error: null,
    });

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText("Draft a board brief.")).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: /Submit for Evaluation/ })).toBeInTheDocument();
  });

  it("shows 'No protocols found.' when the table is empty", async () => {
    mockSelect.mockResolvedValue({ data: [], error: null });

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText("No protocols found.")).toBeInTheDocument()
    );
  });

  it("surfaces a connection error instead of silently showing empty state", async () => {
    mockSelect.mockResolvedValue({
      data: null,
      error: { message: "permission denied for table scenarios" },
    });

    render(<Home />);

    await waitFor(() =>
      expect(
        screen.getByText(/Connection error: permission denied for table scenarios/)
      ).toBeInTheDocument()
    );
    expect(console.error).toHaveBeenCalled();
  });

  it("submits the response and displays score, feedback and Elo", async () => {
    mockSelect.mockResolvedValue({
      data: [{ id: "1", prompt_text: "Draft a board brief." }],
      error: null,
    });

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        score: 82,
        upgraded_text: "An incisive rewrite.",
        replaced_words: [{ basic: "use", advanced: "leverage" }],
        feedback: "Too verbose.",
        new_elo: 1208,
        new_streak: 3,
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText("Draft a board brief.")).toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText("Your response"), {
      target: { value: "We should use this approach." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit for Evaluation/ }));

    await waitFor(() => expect(screen.getByText("82")).toBeInTheDocument());
    expect(screen.getByText("Too verbose.")).toBeInTheDocument();
    expect(screen.getByText("An incisive rewrite.")).toBeInTheDocument();
    expect(screen.getByText("leverage")).toBeInTheDocument();
    expect(screen.getByText("1208")).toBeInTheDocument();

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({
      text: "We should use this approach.",
      scenario: "Draft a board brief.",
    });
  });

  it("shows an error message when evaluation fails", async () => {
    mockSelect.mockResolvedValue({
      data: [{ id: "1", prompt_text: "Draft a board brief." }],
      error: null,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Failed to analyze syntax. Check API logs." }),
    }) as unknown as typeof fetch;

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText("Draft a board brief.")).toBeInTheDocument()
    );

    fireEvent.change(screen.getByLabelText("Your response"), {
      target: { value: "Something." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit for Evaluation/ }));

    await waitFor(() =>
      expect(
        screen.getByText("Failed to analyze syntax. Check API logs.")
      ).toBeInTheDocument()
    );
  });
});
