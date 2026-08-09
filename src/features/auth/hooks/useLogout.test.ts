import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useLogout } from "./useLogout";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the logout endpoint and redirects to /login on success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
    expect(toast.success).toHaveBeenCalledWith("Berhasil logout");
    expect(push).toHaveBeenCalledWith("/login");
    expect(refresh).toHaveBeenCalled();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("shows an error toast and stays put when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    const { result } = renderHook(() => useLogout());

    await act(async () => {
      await result.current.logout();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Gagal logout. Silakan coba lagi.",
    );
    expect(push).not.toHaveBeenCalled();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
