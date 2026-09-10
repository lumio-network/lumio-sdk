// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { Badge } from "./components/Badge";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { cn } from "./cn";

// Not using vitest `globals`, so register Testing Library's DOM cleanup ourselves.
afterEach(cleanup);

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("Button", () => {
  it("renders its children and forwards the type attribute", () => {
    const { getByRole } = render(<Button type="submit">Contribute</Button>);
    const button = getByRole("button", { name: "Contribute" });
    expect(button.getAttribute("type")).toBe("submit");
  });

  it("applies the primary (lumen) variant by default", () => {
    const { getByRole } = render(<Button>Go</Button>);
    expect(getByRole("button").className).toContain("bg-lumen");
  });

  it("defaults to type='button' when no type is provided", () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole("button").getAttribute("type")).toBe("button");
  });

  it("forwards a ref to the underlying <button> element", () => {
    const ref = createRef<HTMLButtonElement>();
    const { getByRole } = render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).toBe(getByRole("button", { name: "Ref test" }));
  });
});

describe("Input", () => {
  it("forwards a ref to the underlying <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    const { getByRole } = render(<Input ref={ref} aria-label="test input" />);
    expect(ref.current).toBe(getByRole("textbox", { name: "test input" }));
  });
});

describe("Badge", () => {
  it("uses the requested semantic variant", () => {
    const { getByText } = render(<Badge variant="teal">Open</Badge>);
    expect(getByText("Open").className).toContain("bg-teal");
  });
});
