"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Laptop, Sun, Moon } from "@phosphor-icons/react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="mode-toggle" aria-label="Toggle theme">
                <button className="toggle-icon" aria-label="Light mode">
                    <Sun size={24} weight="bold" />
                </button>
                <button className="toggle-icon active" aria-label="System mode">
                    <Laptop size={24} weight="bold" />
                </button>
                <button className="toggle-icon" aria-label="Dark mode">
                    <Moon size={24} weight="bold" />
                </button>
            </div>
        );
    }

    return (
        <div className="mode-toggle" aria-label="Toggle theme">
            <button
                className={`toggle-icon ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
                aria-label="Light mode"
            >
                <Sun size={24} weight="bold" />
            </button>
            <button
                className={`toggle-icon ${theme === "system" ? "active" : ""}`}
                onClick={() => setTheme("system")}
                aria-label="System mode"
            >
                <Laptop size={24} weight="bold" />
            </button>
            <button
                className={`toggle-icon ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
                aria-label="Dark mode"
            >
                <Moon size={24} weight="bold" />
            </button>
        </div>
    );
}
