import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

// ─── IconButton ────────────────────────────────────────────────────────────────
// Square button for icon-only actions.
// Radix Slot powers `asChild` for polymorphic rendering.
// Visual styles are unchanged: polished CSS class names from tokens.css.
//
// Usage:
//   <IconButton aria-label="Edit" icon={PencilSimple} variant="primary" />
//   <IconButton aria-label="Settings" icon={Gear} variant="secondary" />
//   <IconButton asChild aria-label="Home"><a href="/">…</a></IconButton>

type IconButtonVariant = "primary" | "secondary";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  /** Phosphor icon component, e.g. PencilSimple, Gear, X */
  icon: PhosphorIcon;
  /** regular = 16px regular, bold = 24px bold */
  iconWeight?: "regular" | "bold";
  /** aria-label is required for icon-only buttons */
  "aria-label": string;
  /** Render child element as the button (Radix Slot) */
  asChild?: boolean;
}

const variantClass: Record<IconButtonVariant, string> = {
  primary: "icon-button-primary",
  secondary: "icon-button-secondary",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "primary",
      className,
      icon: Icon,
      iconWeight = "regular",
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const iconProps =
      iconWeight === "bold"
        ? { size: 24 as const, weight: "bold" as const }
        : { size: 16 as const, weight: "regular" as const };

    const classes = ["icon-button", variantClass[variant], className ?? ""]
      .filter(Boolean)
      .join(" ");

    return (
      <Comp ref={ref} data-slot="icon-button" className={classes} {...props}>
        <Icon size={iconProps.size} weight={iconProps.weight} aria-hidden="true" />
      </Comp>
    );
  },
);

IconButton.displayName = "IconButton";
