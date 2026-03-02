"use client";

import { useRouter } from "next/navigation";
import { BackNavigation } from "@/components/BackNavigation";

export default function CheckEmail() {
    const router = useRouter();

    return (
        <>
            <div className="form-content-wrapper">
                <main className="main-content content-wide">
                    <div className="form-back-wrapper">
                        <BackNavigation />
                        <div className="login-container">
                            <h1 className="headline">ПЕРЕВІРТЕ СВОЮ ПОШТУ</h1>
                            <p className="subtitle email-sent">Лист з підтвердженням на зміну паролю було надіслано на вашу пошту <span className="email-highlight">yourexample@email.com</span></p>

                            <button className="btn-primary" onClick={() => router.push('/new-password')}>Повернутися до авторизації</button>
                        </div>
                    </div>

                </main>
            </div>
        </>
    );
}
