"use client";

import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";

export default function CheckEmail() {
    const router = useRouter();

    return (
        <>
            <Header showBack backHref="/forgot-password" />
            <main className="main-content content-wide">
                <h1 className="headline">ПЕРЕВІРТЕ СВОЮ ПОШТУ</h1>
                <p className="subtitle email-sent">Лист з підтвердженням на зміну паролю було надіслано на вашу пошту <span className="email-highlight">yourexample@email.com</span></p>

                <div className="login-container">
                    <button className="btn-primary" onClick={() => router.push('/new-password')}>Повернутися до авторизації</button>
                </div>

                <p className="footer-text">Обмежений доступ. Тільки для персоналу СР КПІ</p>
            </main>
        </>
    );
}
