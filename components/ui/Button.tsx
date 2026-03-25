import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

// ─── Button ────────────────────────────────────────────────────────────────────
// Radix Slot powers the `asChild` pattern so any element can be styled as a
// button (e.g. <Button asChild><Link href="…">Go</Link></Button>).
// Visual styles are unchanged: polished CSS class names from tokens.css.
//
// Usage:
//   <Button>Label</Button>
//   <Button variant="secondary" size="sm">Label</Button>
//   <Button iconLeft={<ArrowLeft />}>Back</Button>
//   <Button asChild><a href="/page">Page</a></Button>

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "default" | "sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label */
  iconLeft?: React.ReactNode;
  /** Icon rendered after the label */
  iconRight?: React.ReactNode;
  /** Stretch to fill container width */
  fullWidth?: boolean;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Render child element as the button (Radix Slot) */
  asChild?: boolean;
}

const classMap: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { default: "btn-primary", sm: "btn-primary-sm" },
  secondary: { default: "btn-secondary", sm: "btn-secondary-sm" },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      iconLeft,
      iconRight,
      fullWidth = false,
      loading = false,
      asChild = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const base = classMap[variant][size];
    const classes = [
      base,
      fullWidth ? "btn-full" : "",
      loading ? "loading" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <>
            {iconLeft && (
              <span className="btn-icon" aria-hidden="true">
                {iconLeft}
              </span>
            )}
            {children}
            {iconRight && (
              <span className="btn-icon" aria-hidden="true">
                {iconRight}
              </span>
            )}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";
