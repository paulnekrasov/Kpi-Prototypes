"use client";

import Link from "next/link";
import { BackNavigation } from "@components/layout/BackNavigation";

export default function CheckEmail() {

    return (
        <>
            <div className="form-content-wrapper">
                <main className="main-content content-wide">
                    <div className="form-back-wrapper">
                        <BackNavigation />
                        <div className="login-container">
                            <h1 className="headline">ПЕРЕВІРТЕ СВОЮ ПОШТУ</h1>
                            <p className="subtitle email-sent">Лист з підтвердженням на зміну паролю було надіслано на вашу пошту <span className="email-highlight">yourexample@email.com</span></p>

                            <Link href="/new-password" className="btn-primary">Повернутися до авторизації</Link>
                        </div>
                    </div>

                </main>
            </div>
        </>
    );
}
