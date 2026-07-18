import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCmsFormSubmit } from "./useCmsFormSubmit";
import { toast } from "sonner";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useCmsFormSubmit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("POSTs to apiPath and shows the created message when no id is given", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 201 }));

    const { result } = renderHook(() =>
      useCmsFormSubmit({
        apiPath: "/api/cms/faqs",
        listPath: "/admin/cms/faqs",
        createdMessage: "FAQ berhasil dibuat",
        updatedMessage: "FAQ berhasil diperbarui",
        errorMessage: "Gagal menyimpan FAQ",
      }),
    );

    await act(async () => {
      await result.current.submit({ question: "Q" });
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/cms/faqs",
      expect.objectContaining({ method: "POST" }),
    );
    expect(toast.success).toHaveBeenCalledWith("FAQ berhasil dibuat");
    expect(push).toHaveBeenCalledWith("/admin/cms/faqs");
    expect(refresh).toHaveBeenCalled();
  });

  it("shows the error toast and does not redirect when the request fails", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

    const { result } = renderHook(() =>
      useCmsFormSubmit({
        apiPath: "/api/cms/faqs",
        id: "faq-1",
        listPath: "/admin/cms/faqs",
        createdMessage: "FAQ berhasil dibuat",
        updatedMessage: "FAQ berhasil diperbarui",
        errorMessage: "Gagal menyimpan FAQ",
      }),
    );

    await act(async () => {
      await result.current.submit({ question: "Q" });
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/cms/faqs/faq-1",
      expect.objectContaining({ method: "PUT" }),
    );
    expect(toast.error).toHaveBeenCalledWith("Gagal menyimpan FAQ");
    expect(push).not.toHaveBeenCalled();
  });
});
