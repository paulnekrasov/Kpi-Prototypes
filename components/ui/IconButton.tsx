import React, { forwardRef } from "react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

// ──────────────────────────────────────────────
// IconButton
// ──────────────────────────────────────────────
// Square button for icon-only actions.
// Supports primary & secondary variants.
//
// Usage:
//   <IconButton aria-label="Edit" icon={PencilSimple} variant="primary" />
//   <IconButton aria-label="Settings" icon={Gear} variant="secondary" />

type IconButtonVariant = "primary" | "secondary";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: IconButtonVariant;
    /** Phosphor icon component, e.g. PencilSimple, Gear, X */
    icon: PhosphorIcon;
    /** regular = 16px regular, bold = 24px bold */
    iconWeight?: "regular" | "bold";
    /** aria-label is required for icon-only buttons to ensure accessibility */
    "aria-label": string;
}

const variantClass: Record<IconButtonVariant, string> = {
    primary: "icon-button-primary",
    secondary: "icon-button-secondary",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    (
        {
            variant = "primary",
            className,
            icon: Icon,
            iconWeight = "regular",
            ...props
        },
        ref,
    ) => {
        const iconProps =
            iconWeight === "bold"
                ? { size: 24 as const, weight: "bold" as const }
                : { size: 16 as const, weight: "regular" as const };

        const classes = [
            "icon-button",
            variantClass[variant],
            className ?? "",
        ]
            .filter(Boolean)
            .join(" ");

        return (
            <button ref={ref} className={classes} {...props}>
                <Icon size={iconProps.size} weight={iconProps.weight} aria-hidden="true" />
            </button>
        );
    },
);

IconButton.displayName = "IconButton";
