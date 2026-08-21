import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComboboxField } from "./ComboboxField";
import type { SelectOption } from "./selectOption";

// Radix Popover positions with these; jsdom ships neither.
beforeAll(() => {
  global.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = vi.fn(() => false);
  Element.prototype.releasePointerCapture = vi.fn();
});

const teachers: SelectOption[] = [
  { value: "t1", label: "Ahmad Fauzi" },
  { value: "t2", label: "Budi Santoso" },
  { value: "t3", label: "Citra Dewi" },
];

function renderCombobox(
  props: Partial<React.ComponentProps<typeof ComboboxField>> = {},
) {
  const onChange = vi.fn();
  render(
    <ComboboxField
      ariaLabel="Guru"
      value=""
      onChange={onChange}
      options={teachers}
      {...props}
    />,
  );
  return { onChange };
}

function open(name = "Guru"): void {
  fireEvent.click(screen.getByRole("combobox", { name }));
}

describe("ComboboxField", () => {
  it("filters by label and emits the option's value", () => {
    const { onChange } = renderCombobox();
    open();

    fireEvent.change(screen.getByPlaceholderText("Cari guru…"), {
      target: { value: "budi" },
    });

    expect(screen.queryByText("Ahmad Fauzi")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Budi Santoso"));
    expect(onChange).toHaveBeenCalledWith("t2");
  });

  it("shows the selected label on the trigger", () => {
    renderCombobox({ value: "t3" });

    expect(screen.getByRole("combobox", { name: "Guru" })).toHaveTextContent(
      "Citra Dewi",
    );
  });

  it("never matches an option id, so a cuid-like query finds nothing", () => {
    renderCombobox();
    open();

    fireEvent.change(screen.getByPlaceholderText("Cari guru…"), {
      target: { value: "t1" },
    });

    expect(screen.getByText("Tidak ada hasil.")).toBeInTheDocument();
  });

  it("emits an empty string for the opt-out choice", () => {
    const { onChange } = renderCombobox({
      value: "t1",
      emptyLabel: "— Belum ada —",
    });
    open();

    fireEvent.click(screen.getByText("— Belum ada —"));
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("caps a long list and says how much is hidden", () => {
    const many: SelectOption[] = Array.from({ length: 250 }, (_, index) => ({
      value: `s${index}`,
      label: `Siswa ${index}`,
    }));
    renderCombobox({ options: many, ariaLabel: "Siswa" });
    open("Siswa");

    expect(screen.getAllByText(/^Siswa \d+$/)).toHaveLength(100);
    expect(screen.getByText(/Menampilkan 100 dari 250/)).toBeInTheDocument();
  });
});
