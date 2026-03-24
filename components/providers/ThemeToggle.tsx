"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Laptop, SunDim, Moon } from "@phosphor-icons/react";

type ThemeOption = "light" | "system" | "dark";

const THEME_INDEX: Record<ThemeOption, number> = {
    light: 0,
    system: 1,
    dark: 2,
};

const THEME_OPTIONS: ReadonlyArray<{
    value: ThemeOption;
    label: string;
    Icon: typeof SunDim;
}> = [
    { value: "light", label: "Світла тема", Icon: SunDim },
    { value: "system", label: "Системна тема", Icon: Laptop },
    { value: "dark", label: "Темна тема", Icon: Moon },
];

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = (mounted ? theme : "system") as ThemeOption;
    const activeIndex = THEME_INDEX[activeTheme] ?? 1;

    const handleThemeKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        let nextIndex: number | null = null;

        switch (event.key) {
            case "ArrowRight":
            case "ArrowDown":
                nextIndex = (activeIndex + 1) % THEME_OPTIONS.length;
                break;
            case "ArrowLeft":
            case "ArrowUp":
                nextIndex = (activeIndex - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = THEME_OPTIONS.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();

        const nextTheme = THEME_OPTIONS[nextIndex];
        setTheme(nextTheme.value);
        buttonRefs.current[nextIndex]?.focus();
    };

    return (
        <div
            className="mode-toggle"
            role="radiogroup"
            aria-label="Вибір теми"
            style={{ "--active-index": activeIndex } as CSSProperties}
        >
            <span className="toggle-pill" aria-hidden="true" />

            {THEME_OPTIONS.map(({ value, label, Icon }) => {
                const isActive = activeTheme === value;
                const optionIndex = THEME_INDEX[value];

                return (
                    <button
                        key={value}
                        ref={(element) => {
                            buttonRefs.current[optionIndex] = element;
                        }}
                        type="button"
                        className={`toggle-icon ${isActive ? "active" : ""}`}
                        role="radio"
                        aria-checked={isActive}
                        tabIndex={isActive ? 0 : -1}
                        data-state={isActive ? "active" : "inactive"}
                        onClick={() => setTheme(value)}
                        onKeyDown={handleThemeKeyDown}
                        aria-label={label}
                        title={label}
                    >
                        <Icon size={20} weight="bold" aria-hidden="true" />
                    </button>
                );
            })}
        </div>
    );
}
