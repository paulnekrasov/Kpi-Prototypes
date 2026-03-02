"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Laptop, Sun, Moon } from "@phosphor-icons/react";

const THEMES = ["light", "system", "dark"] as const;
type ThemeOption = typeof THEMES[number];

const THEME_INDEX: Record<ThemeOption, number> = {
    light: 0,
    system: 1,
    dark: 2,
};

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = (mounted ? theme : "system") as ThemeOption;
    const activeIndex = THEME_INDEX[activeTheme] ?? 1;

    return (
        <div
            className="mode-toggle"
            role="group"
            aria-label="Вибір теми"
            style={{ "--active-index": activeIndex } as React.CSSProperties}
        >
            {/* Sliding pill */}
            <span className="toggle-pill" aria-hidden="true" />

            <button
                className={`toggle-icon ${activeTheme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
                aria-label="Світла тема"
                aria-pressed={activeTheme === "light"}
            >
                <Sun size={20} weight="bold" aria-hidden="true" />
            </button>
            <button
                className={`toggle-icon ${activeTheme === "system" ? "active" : ""}`}
                onClick={() => setTheme("system")}
                aria-label="Системна тема"
                aria-pressed={activeTheme === "system"}
            >
                <Laptop size={20} weight="bold" aria-hidden="true" />
            </button>
            <button
                className={`toggle-icon ${activeTheme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
                aria-label="Темна тема"
                aria-pressed={activeTheme === "dark"}
            >
                <Moon size={20} weight="bold" aria-hidden="true" />
            </button>
        </div>
    );
}
