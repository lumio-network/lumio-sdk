// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { Badge } from "./components/Badge";
import { Button } from "./components/Button";
import { Card, CardBody, CardTitle } from "./components/Card";
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

  it("applies the secondary variant classes", () => {
    const { getByRole } = render(<Button variant="secondary">Save</Button>);
    expect(getByRole("button").className).toContain("bg-ink-700");
  });

  it("applies the ghost variant classes", () => {
    const { getByRole } = render(<Button variant="ghost">Cancel</Button>);
    expect(getByRole("button").className).toContain("bg-transparent");
  });

  it("applies the sm size classes", () => {
    const { getByRole } = render(<Button size="sm">Small</Button>);
    expect(getByRole("button").className).toContain("h-8");
  });

  it("applies the md size classes by default", () => {
    const { getByRole } = render(<Button>Medium</Button>);
    expect(getByRole("button").className).toContain("h-10");
  });

  it("applies the lg size classes", () => {
    const { getByRole } = render(<Button size="lg">Large</Button>);
    expect(getByRole("button").className).toContain("h-12");
  });
});

describe("Input", () => {
  it("forwards a ref to the underlying <input> element", () => {
    const ref = createRef<HTMLInputElement>();
    const { getByRole } = render(<Input ref={ref} aria-label="test input" />);
    expect(ref.current).toBe(getByRole("textbox", { name: "test input" }));
  });

  it("defaults type to 'text'", () => {
    const { getByRole } = render(<Input aria-label="name" />);
    expect(getByRole("textbox").getAttribute("type")).toBe("text");
  });

  it("forwards the placeholder attribute", () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter value" />);
    expect(getByPlaceholderText("Enter value")).toBeTruthy();
  });

  it("forwards the disabled attribute", () => {
    const { getByRole } = render(<Input aria-label="disabled field" disabled />);
    expect((getByRole("textbox") as HTMLInputElement).disabled).toBe(true);
  });

  it("merges a custom className", () => {
    const { getByRole } = render(<Input aria-label="styled" className="custom-class" />);
    expect(getByRole("textbox").className).toContain("custom-class");
  });
});

describe("Card", () => {
  it("renders its children", () => {
    const { getByText } = render(<Card>Card content</Card>);
    expect(getByText("Card content")).toBeTruthy();
  });

  it("merges a custom className", () => {
    const { getByText } = render(<Card className="custom-card">Content</Card>);
    expect(getByText("Content").className).toContain("custom-card");
  });

  it("forwards a ref to the underlying <div> element", () => {
    const ref = createRef<HTMLDivElement>();
    const { getByText } = render(<Card ref={ref}>Ref card</Card>);
    expect(ref.current).toBe(getByText("Ref card"));
  });
});

describe("CardTitle", () => {
  it("renders its children", () => {
    const { getByText } = render(<CardTitle>My Title</CardTitle>);
    expect(getByText("My Title")).toBeTruthy();
  });

  it("merges a custom className", () => {
    const { getByText } = render(<CardTitle className="custom-title">Title</CardTitle>);
    expect(getByText("Title").className).toContain("custom-title");
  });
});

describe("CardBody", () => {
  it("renders its children", () => {
    const { getByText } = render(<CardBody>Body text</CardBody>);
    expect(getByText("Body text")).toBeTruthy();
  });

  it("merges a custom className", () => {
    const { getByText } = render(<CardBody className="custom-body">Body</CardBody>);
    expect(getByText("Body").className).toContain("custom-body");
  });
});

describe("Badge", () => {
  it("uses the requested semantic variant — teal", () => {
    const { getByText } = render(<Badge variant="teal">Open</Badge>);
    expect(getByText("Open").className).toContain("bg-teal");
  });

  it("applies the neutral variant by default", () => {
    const { getByText } = render(<Badge>Default</Badge>);
    expect(getByText("Default").className).toContain("bg-ink-700");
  });

  it("applies the lumen variant", () => {
    const { getByText } = render(<Badge variant="lumen">Hot</Badge>);
    expect(getByText("Hot").className).toContain("bg-lumen");
  });

  it("applies the coral variant", () => {
    const { getByText } = render(<Badge variant="coral">Error</Badge>);
    expect(getByText("Error").className).toContain("bg-coral");
  });

  it("applies the sky variant", () => {
    const { getByText } = render(<Badge variant="sky">Info</Badge>);
    expect(getByText("Info").className).toContain("bg-sky");
  });
});
