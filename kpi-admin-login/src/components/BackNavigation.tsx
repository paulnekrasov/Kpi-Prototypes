"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

export function BackNavigation() {
    const pathname = usePathname();
    let showBack = false;
    let backHref = "/";

    if (pathname === "/forgot-password") {
        showBack = true;
        backHref = "/";
    } else if (pathname === "/check-email") {
        showBack = true;
        backHref = "/forgot-password";
    } else if (pathname === "/new-password") {
        showBack = true;
        backHref = "/check-email";
    }

    if (!showBack) return null;

    return (
        <Link href={backHref} className="btn-back">
            <ArrowLeft size={24} weight="bold" />
            Назад
        </Link>
    );
}
