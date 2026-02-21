import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";

interface HeaderProps {
    showBack?: boolean;
    backHref?: string;
}

export function Header({ showBack, backHref = "/" }: HeaderProps) {
    const content = (
        <header className="header">
            <div className="logo">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 0C8.95431 0 0 8.95431 0 20C0 31.0457 8.95431 40 20 40V0Z" fill="var(--primary-btn)" />
                    <rect x="24" y="10" width="8" height="30" fill="var(--primary-btn)" />
                </svg>
                <div className="logo-text">
                    СТУДРАДА<br />КПІ
                </div>
            </div>
            <ThemeToggle />
        </header>
    );

    if (showBack) {
        return (
            <div className="header-container">
                {content}
                <Link href={backHref} className="btn-back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Назад
                </Link>
            </div>
        );
    }

    return content;
}
