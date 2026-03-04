"use client";

import React from "react";
import { ThemeToggle } from "../providers/ThemeToggle";
import { Logo } from "./Logo";

export function Header() {
    return (
        <header className="header">
            <div className="logo">
                <Logo />
            </div>
            <ThemeToggle />
        </header>
    );
}
