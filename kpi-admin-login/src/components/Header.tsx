import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import Link from "next/link";
import { Logo } from "./Logo";
import { ArrowLeft } from "@phosphor-icons/react";

interface HeaderProps {
    showBack?: boolean;
    backHref?: string;
}

export function Header({ showBack, backHref = "/" }: HeaderProps) {
    const content = (
        <header className="header">
            <div className="logo">
                <Logo />
            </div>
            <ThemeToggle />
        </header>
    );

    if (showBack) {
        return (
            <div className="header-container">
                {content}
                <Link href={backHref} className="btn-back">
                    <ArrowLeft size={24} weight="bold" />
                    Назад
                </Link>
            </div>
        );
    }

    return content;
}
