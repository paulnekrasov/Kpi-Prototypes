"use client";

import { useState } from "react";
import { InputGroup } from "@/components/InputGroup";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "@phosphor-icons/react";

export default function NewPassword() {
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [newPassStatus, setNewPassStatus] = useState<"default" | "success" | "error">("default");
    const [newPassMsg, setNewPassMsg] = useState("");

    const [confPassStatus, setConfPassStatus] = useState<"default" | "success" | "error">("default");
    const [confPassMsg, setConfPassMsg] = useState("");

    const checkStrength = (pass: string) => {
        const requirements = [
            { regex: /.{8,}/, text: "Мінімум 8 символів" },
            { regex: /\p{N}/u, text: "Мінімум 1 цифра" },
            { regex: /\p{Ll}/u, text: "Мінімум 1 мала літера" },
            { regex: /\p{Lu}/u, text: "Мінімум 1 велика літера" },
        ];

        return requirements.map((req) => ({
            met: req.regex.test(pass),
            text: req.text,
        }));
    };

    const strength = checkStrength(newPassword);
    const strengthScore = strength.filter((req) => req.met).length;

    const getStrengthColor = (score: number) => {
        if (score === 0) return "transparent";
        if (score <= 1) return "var(--destructive)";
        if (score <= 2) return "#f97316";
        if (score === 3) return "#eab308";
        return "var(--accent-success)";
    };

    const getStrengthText = (score: number) => {
        if (score === 0) return "Введіть пароль";
        if (score <= 1) return "Слабкий пароль";
        if (score <= 2) return "Середній пароль";
        if (score === 3) return "Гарний пароль";
        return "Надійний пароль";
    };

    const validateNewPasswords = (newVal: string, confVal: string) => {
        const currentStrength = checkStrength(newVal);
        const score = currentStrength.filter((req) => req.met).length;
        let isNewPassValid = false;

        if (newVal !== '') {
            if (score === 4) {
                setNewPassStatus("success");
                setNewPassMsg("");
                isNewPassValid = true;
            } else {
                setNewPassStatus("error");
                setNewPassMsg("Пароль не відповідає всім вимогам");
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
            <div className="form-content-wrapper">
                <main className="main-content content-wide">
                    <div className="login-container">
                        <h1 className="headline">СТВОРІТЬ НОВИЙ ПАРОЛЬ</h1>
                        <p className="subtitle">Введіть новий пароль і підвердіть його</p>

                        <InputGroup
                            label="New Password"
                            type="password"
                            name="newPassword"
                            autoComplete="new-password"
                            placeholder="Password"
                            value={newPassword}
                            onChange={handleNewPassChange}
                            onBlur={() => validateNewPasswords(newPassword, confirmPassword)}
                            status={newPassStatus}
                            message={newPassMsg}
                        />

                        {/* Password strength indicator */}
                        <div
                            aria-label="Password strength"
                            aria-valuemax={4}
                            aria-valuemin={0}
                            aria-valuenow={strengthScore}
                            role="progressbar"
                            tabIndex={-1}
                            style={{
                                marginTop: "12px",
                                marginBottom: "16px",
                                height: "4px",
                                width: "100%",
                                overflow: "hidden",
                                borderRadius: "9999px",
                                backgroundColor: "var(--stroke-subtle)",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    backgroundColor: newPassword ? getStrengthColor(strengthScore) : "transparent",
                                    transition: "all 500ms ease-out",
                                    width: `${(strengthScore / 4) * 100}%`,
                                }}
                            />
                        </div>

                        {/* Password strength description */}
                        <p
                            style={{
                                marginBottom: "8px",
                                fontWeight: 500,
                                color: "var(--text-main)",
                                fontSize: "14px",
                            }}
                        >
                            {getStrengthText(strengthScore)}. Повинен містити:
                        </p>

                        {/* Password requirements list */}
                        <ul aria-label="Password requirements" style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            listStyle: "none",
                            marginBottom: "24px"
                        }}>
                            {strength.map((req) => (
                                <li key={req.text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {req.met ? (
                                        <CheckCircle
                                            aria-hidden="true"
                                            size={16}
                                            weight="fill"
                                            color="var(--accent-success)"
                                        />
                                    ) : (
                                        <XCircle
                                            aria-hidden="true"
                                            size={16}
                                            weight="fill"
                                            color="var(--text-subtle)"
                                        />
                                    )}
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            color: req.met ? "var(--accent-success)" : "var(--text-muted)"
                                        }}
                                    >
                                        {req.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <InputGroup
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
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
            </div>
        </>
    );
}
