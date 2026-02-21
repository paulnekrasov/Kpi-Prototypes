"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { InputGroup } from "@/components/InputGroup";
import { useRouter } from "next/navigation";

export default function NewPassword() {
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [newPassStatus, setNewPassStatus] = useState<"default" | "success" | "error">("default");
    const [newPassMsg, setNewPassMsg] = useState("");

    const [confPassStatus, setConfPassStatus] = useState<"default" | "success" | "error">("default");
    const [confPassMsg, setConfPassMsg] = useState("");

    const validateNewPasswords = (newVal: string, confVal: string) => {
        let isNewPassValid = false;
        if (newVal !== '') {
            if (newVal.length >= 6) {
                setNewPassStatus("success");
                setNewPassMsg("");
                isNewPassValid = true;
            } else {
                setNewPassStatus("error");
                setNewPassMsg("Мінімум 6 символів");
            }
        } else {
            setNewPassStatus("default");
            setNewPassMsg("");
        }

        if (confVal !== '') {
            if (confVal === newVal && isNewPassValid) {
                setConfPassStatus("success");
                setConfPassMsg("Чудово! Все добре.");
            } else {
                setConfPassStatus("error");
                setConfPassMsg("Паролі не співпадають");
            }
        } else {
            setConfPassStatus("default");
            setConfPassMsg("");
        }
    };

    const handleNewPassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setNewPassword(val);
        validateNewPasswords(val, confirmPassword);
    };

    const handleConfPassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setConfirmPassword(val);
        validateNewPasswords(newPassword, val);
    };

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        validateNewPasswords(newPassword, confirmPassword);

        if (newPassStatus === "error" || confPassStatus === "error" || newPassword === "" || confirmPassword === "") {
            if (newPassword === "") {
                setNewPassStatus("error");
                setNewPassMsg("Обов'язкове поле");
            }
            if (confirmPassword === "") {
                setConfPassStatus("error");
                setConfPassMsg("Обов'язкове поле");
            }
        } else {
            router.push("/");
        }
    };

    return (
        <>
            <Header showBack backHref="/check-email" />
            <main className="main-content content-wide">
                <h1 className="headline">СТВОРІТЬ НОВИЙ ПАРОЛЬ</h1>
                <p className="subtitle">Введіть новий пароль і підвердіть його</p>

                <div className="login-container">
                    <InputGroup
                        label="New Password"
                        type="password"
                        placeholder="Password"
                        value={newPassword}
                        onChange={handleNewPassChange}
                        onBlur={() => validateNewPasswords(newPassword, confirmPassword)}
                        status={newPassStatus}
                        message={newPassMsg}
                    />

                    <InputGroup
                        label="Confirm New Password"
                        type="password"
                        placeholder="Password"
                        value={confirmPassword}
                        onChange={handleConfPassChange}
                        onBlur={() => validateNewPasswords(newPassword, confirmPassword)}
                        status={confPassStatus}
                        message={confPassMsg}
                    />

                    <button className="btn-primary" onClick={handleSubmit} style={{ marginTop: 24 }}>
                        Зберігти Пароль
                    </button>
                </div>

                <p className="footer-text">Обмежений доступ. Тільки для персоналу СР КПІ</p>
            </main>
        </>
    );
}
