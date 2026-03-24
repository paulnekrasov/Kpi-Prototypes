import React, { forwardRef } from "react";

// ──────────────────────────────────────────────
// Button
// ──────────────────────────────────────────────
// Supports primary & secondary variants in default + small sizes.
// Icons can be placed on the left, right, or both sides.
//
// Usage:
//   <Button>Label</Button>
//   <Button variant="secondary" size="sm">Label</Button>
//   <Button iconLeft={<ArrowLeft />}>Back</Button>
//   <Button iconRight={<ArrowRight />}>Next</Button>
//   <Button iconLeft={<Search />} iconRight={<ChevronDown />}>Search</Button>

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
}

const classMap: Record<ButtonVariant, Record<ButtonSize, string>> = {
    primary: { default: "btn-primary", sm: "btn-primary-sm" },
    secondary: { default: "btn-secondary", sm: "btn-secondary-sm" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "default",
            iconLeft,
            iconRight,
            fullWidth = false,
            loading = false,
            disabled,
            className,
            children,
            ...props
        },
        ref,
    ) => {
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
            <button
                ref={ref}
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
            </button>
        );
    },
);

Button.displayName = "Button";
