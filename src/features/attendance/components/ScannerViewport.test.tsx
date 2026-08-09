import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { ScannerViewport } from "./ScannerViewport";

function renderViewport(scanning: boolean, onCancel = vi.fn()) {
  const ref = createRef<HTMLVideoElement>();
  const { container } = render(
    <ScannerViewport
      videoRef={ref}
      scanning={scanning}
      aspectClassName="aspect-square"
      cancelLabel="Batal"
      onCancel={onCancel}
    />,
  );
  return { ref, container, onCancel };
}

describe("ScannerViewport", () => {
  it("keeps the video mounted while idle so start() can reach it", () => {
    const { ref, container } = renderViewport(false);

    expect(ref.current).toBeInstanceOf(HTMLVideoElement);
    expect(container.firstElementChild?.className).toContain("hidden");
  });

  it("shows the preview and cancels while scanning", () => {
    const { container, onCancel } = renderViewport(true);

    expect(container.firstElementChild?.className).not.toContain("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onCancel).toHaveBeenCalled();
  });
});
