"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { InputGroup } from "@/components/InputGroup";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [emailStatus, setEmailStatus] = useState<"default" | "success" | "error">("default");
    const [emailMsg, setEmailMsg] = useState("");

    const validateEmailFormat = (val: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(val).toLowerCase());
    };

    const validateEmail = (val: string) => {
        setEmail(val);
        if (val.trim() !== '') {
            if (validateEmailFormat(val)) {
                setEmailStatus("success");
                setEmailMsg("Чудово! Все добре.");
            } else {
                setEmailStatus("error");
                setEmailMsg("Недійсний email");
            }
        } else {
            setEmailStatus("default");
            setEmailMsg("");
        }
    };

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        validateEmail(email);
        if (emailStatus === "error" || email.trim() === "") {
            if (email.trim() === "") {
                setEmailStatus("error");
                setEmailMsg("Обов'язкове поле");
            }
        } else {
            router.push("/check-email");
        }
    };

    return (
        <>
            <Header showBack backHref="/" />
            <main className="main-content">
                <h1 className="headline">ЗАБУЛИ ПАРОЛЬ?</h1>
                <p className="subtitle">Введіть електронну адресу, якщо вона правильна вам буде надіслано лист для відновленя паролю.</p>

                <div className="login-container">
                    <InputGroup
                        label="Email"
                        type="email"
                        placeholder="youremail@email.com"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => validateEmail(e.target.value)}
                        onBlur={() => validateEmail(email)}
                        status={emailStatus}
                        message={emailMsg}
                    />

                    <button className="btn-primary" onClick={handleSubmit}>Надіслати електрону адресу</button>
                </div>

                <p className="footer-text">Обмежений доступ. Тільки для персоналу СР КПІ</p>
            </main>
        </>
    );
}
