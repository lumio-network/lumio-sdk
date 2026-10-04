// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { Badge } from "./components/Badge";
import { Button } from "./components/Button";
import { Card, CardBody, CardTitle } from "./components/Card";
import { Input } from "./components/Input";
import { Alert, Skeleton, VisuallyHidden } from "./index";
import { cn } from "./cn";

// Not using vitest `globals`, so register Testing Library's DOM cleanup ourselves.
afterEach(cleanup);

describe("cn", () => {
  it("joins class names and drops empty non-numeric values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("keeps numeric class names including zero", () => {
    expect(cn("a", 0, 2, "b")).toBe("a 0 2 b");
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

  it("shows a busy spinner without changing the button's layout", () => {
    const { getByRole } = render(
      <Button loading className="static text-ink-950">
        Submitting
      </Button>,
    );
    const button = getByRole("button", { name: "Submitting" }) as HTMLButtonElement;
    const spinner = button.querySelector(".lumio-button-spinner");

    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(spinner?.getAttribute("aria-hidden")).toBe("true");
    expect(spinner?.className).toContain("absolute");
    expect(button.style.position).toBe("relative");
    expect(button.style.color).toBe("transparent");
    expect(button.className).toContain("!opacity-0");
  });

  it("applies the disabled state and styles", () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    const button = getByRole("button", { name: "Disabled" }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.className).toContain("disabled:cursor-not-allowed");
    expect(button.className).toContain("disabled:opacity-50");
  });

  it("includes the focus-visible outline classes", () => {
    const { getByRole } = render(<Button>Focus</Button>);
    const className = getByRole("button", { name: "Focus" }).className;

    expect(className).toContain("focus-visible:outline");
    expect(className).toContain("focus-visible:outline-2");
    expect(className).toContain("focus-visible:outline-offset-2");
    expect(className).toContain("focus-visible:outline-lumen");
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

  it("associates a label with the input using a generated id", () => {
    const { getByLabelText, getByText } = render(<Input label="Amount" />);
    const input = getByLabelText("Amount");
    const label = getByText("Amount");

    expect(input).toBeTruthy();
    expect(label.getAttribute("for")).toBe(input.getAttribute("id"));
  });

  it("preserves a provided id and wires hint and error text to the input", () => {
    const { getByRole, getByText } = render(
      <Input
        id="amount"
        label="Amount"
        hint="Use whole units"
        error="Amount is required"
        aria-describedby="external-description"
      />,
    );
    const input = getByRole("textbox", { name: "Amount" });
    const description = input.getAttribute("aria-describedby")?.split(" ");

    expect(input.id).toBe("amount");
    expect(description).toEqual(["external-description", "amount-hint", "amount-error"]);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(getByText("Use whole units").id).toBe("amount-hint");
    expect(getByText("Amount is required").id).toBe("amount-error");
  });

  it("announces errors without making hint text a live region", () => {
    const { getByRole, getByText } = render(<Input hint="Use whole units" error="Required" />);

    expect(getByRole("alert").textContent).toBe("Required");
    expect(getByText("Use whole units").getAttribute("role")).toBeNull();
  });

  it("keeps the bare input behavior when no label or description is provided", () => {
    const { container } = render(<Input aria-label="name" />);
    const input = container.querySelector("input");

    expect(container.firstElementChild).toBe(input);
    expect(input?.hasAttribute("id")).toBe(false);
    expect(input?.hasAttribute("aria-describedby")).toBe(false);
    expect(input?.hasAttribute("aria-invalid")).toBe(false);
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

  it("defaults to h3 and preserves styling when the heading level changes", () => {
    const { getByRole } = render(
      <>
        <CardTitle>Default title</CardTitle>
        <CardTitle as="h2">Overridden title</CardTitle>
      </>,
    );
    const defaultTitle = getByRole("heading", { name: "Default title", level: 3 });
    const overriddenTitle = getByRole("heading", { name: "Overridden title", level: 2 });

    expect(defaultTitle.tagName).toBe("H3");
    expect(overriddenTitle.tagName).toBe("H2");
    expect(overriddenTitle.className).toBe(defaultTitle.className);
  });

  it("forwards a ref and sets its display name", () => {
    const ref = createRef<HTMLHeadingElement>();
    const { getByRole } = render(
      <CardTitle ref={ref} as="h2">
        Ref title
      </CardTitle>,
    );

    expect(ref.current).toBe(getByRole("heading", { name: "Ref title", level: 2 }));
    expect(CardTitle.displayName).toBe("CardTitle");
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
  it("forwards a ref to its span and sets its display name", () => {
    const ref = createRef<HTMLSpanElement>();
    const { getByText } = render(<Badge ref={ref}>Ref badge</Badge>);

    expect(ref.current).toBe(getByText("Ref badge"));
    expect(Badge.displayName).toBe("Badge");
  });

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

describe("Alert", () => {
  it.each([
    ["info", "status", "border-sky-on-light", "text-sky-on-light"],
    ["success", "status", "border-teal-on-light", "text-teal-on-light"],
    ["warning", "status", "border-lumen-dim", "text-lumen-dim"],
    ["danger", "alert", "border-coral-on-light", "text-coral-on-light"],
  ] as const)(
    "styles the %s variant with its semantic role",
    (variant, role, borderClass, textClass) => {
      const { getByRole } = render(<Alert variant={variant}>Notice</Alert>);
      const alert = getByRole(role);

      expect(alert.className).toContain(borderClass);
      expect(alert.className).toContain(textClass);
    },
  );

  it("forwards a ref and sets its display name", () => {
    const ref = createRef<HTMLDivElement>();
    const { getByRole } = render(
      <Alert ref={ref} variant="success">
        Saved
      </Alert>,
    );

    expect(ref.current).toBe(getByRole("status"));
    expect(Alert.displayName).toBe("Alert");
  });
});

describe("Skeleton", () => {
  it("renders as a decorative token-styled placeholder and forwards a ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Skeleton ref={ref} width="75%" height={16} radius="999px" className="custom-skeleton" />,
    );
    const skeleton = container.firstElementChild as HTMLDivElement;

    expect(skeleton.getAttribute("aria-hidden")).toBe("true");
    expect(skeleton.className).toContain("bg-ink-700");
    expect(skeleton.className).toContain("custom-skeleton");
    expect(skeleton.className).toContain("motion-reduce:animate-none");
    expect(skeleton.style.width).toBe("75%");
    expect(skeleton.style.height).toBe("16px");
    expect(skeleton.style.borderRadius).toBe("999px");
    expect(ref.current).toBe(skeleton);
    expect(Skeleton.displayName).toBe("Skeleton");
  });
});

describe("VisuallyHidden", () => {
  it("renders its children without hiding them from assistive tech", () => {
    const { getByText } = render(
      <VisuallyHidden>Only for screen readers</VisuallyHidden>,
    );
    const el = getByText("Only for screen readers");

    expect(el.tagName).toBe("SPAN");
    expect(el.getAttribute("aria-hidden")).toBeNull();
    expect(el.className).toContain("absolute");
    expect(el.className).toContain("h-px");
    expect(el.className).toContain("w-px");
    expect(el.className).toContain("overflow-hidden");
    expect(VisuallyHidden.displayName).toBe("VisuallyHidden");
  });

  it("renders as a custom element via the as prop", () => {
    const { getByText } = render(<VisuallyHidden as="div">Div content</VisuallyHidden>);
    expect(getByText("Div content").tagName).toBe("DIV");
  });

  it("forwards a ref and merges a custom className", () => {
    const ref = createRef<HTMLSpanElement>();
    const { getByText } = render(
      <VisuallyHidden ref={ref} className="custom-vh">
        Text
      </VisuallyHidden>,
    );
    const el = getByText("Text");

    expect(ref.current).toBe(el);
    expect(el.className).toContain("custom-vh");
  });
});
