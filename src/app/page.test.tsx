import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";

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
  });

  it("renders a scenario prompt when data is returned", async () => {
    mockSelect.mockResolvedValue({
      data: [{ prompt_text: "Draft a board brief." }],
      error: null,
    });

    render(<Home />);

    await waitFor(() =>
      expect(screen.getByText("Draft a board brief.")).toBeInTheDocument()
    );
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
});
