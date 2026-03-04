"use client";

import { useState, useRef } from "react";
import { InputGroup } from "@components/ui/InputGroup";
import { useRouter } from "next/navigation";
import { BackNavigation } from "@components/layout/BackNavigation";

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [emailStatus, setEmailStatus] = useState<"default" | "success" | "error">("default");
    const [emailMsg, setEmailMsg] = useState("");
    const emailRef = useRef<HTMLInputElement>(null);

    const validateEmailFormat = (val: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(val).toLowerCase());
    };

    const validateEmail = (val: string) => {
        setEmail(val);
        if (val.trim() !== '') {
            if (validateEmailFormat(val)) {
                setEmailStatus("default");
                setEmailMsg("");
            } else {
                setEmailStatus("error");
                setEmailMsg("Недійсний email");
            }
        } else {
            setEmailStatus("default");
            setEmailMsg("");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isEmailEmpty = email.trim() === "";
        const isEmailValid = !isEmailEmpty && validateEmailFormat(email);

        if (isEmailEmpty) {
            setEmailStatus("error");
            setEmailMsg("Обов\u2019язкове поле");
            emailRef.current?.focus();
        } else if (!isEmailValid) {
            setEmailStatus("error");
            setEmailMsg("Недійсний email");
            emailRef.current?.focus();
        } else {
            router.push("/check-email");
        }
    };

    return (
        <>
            <div className="form-content-wrapper">
                <main className="main-content">
                    <div className="form-back-wrapper">
                        <BackNavigation />
                        <form className="login-container" onSubmit={handleSubmit}>
                            <h1 className="headline">ЗАБУЛИ ПАРОЛЬ?</h1>
                            <p className="subtitle">Введіть електронну адресу, якщо вона правильна вам буде надіслано лист для відновленя паролю.</p>

                            <InputGroup
                                ref={emailRef}
                                label="Електронна пошта"
                                type="email"
                                name="email"
                                placeholder="youremail@email.com…"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => validateEmail(e.target.value)}
                                onBlur={() => validateEmail(email)}
                                status={emailStatus}
                                message={emailMsg}
                            />

                            <button type="submit" className="btn-primary">Надіслати електронну адресу</button>
                        </form>
                    </div>

                </main>
            </div>
        </>
    );
}
