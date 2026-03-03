"use client";

import { useState, useRef } from "react";
import { InputGroup } from "@/components/InputGroup";
import { useRouter } from "next/navigation";
import { WarningCircle, CheckCircle } from "@phosphor-icons/react";
import { BackNavigation } from "@/components/BackNavigation";

export default function NewPassword() {
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const newPassRef = useRef<HTMLInputElement>(null);
    const confPassRef = useRef<HTMLInputElement>(null);

    const [newPassStatus, setNewPassStatus] = useState<"default" | "success" | "error">("default");
    const [newPassMsg, setNewPassMsg] = useState("");

    const [confPassStatus, setConfPassStatus] = useState<"default" | "success" | "error">("default");
    const [confPassMsg, setConfPassMsg] = useState("");

    const requirements = [
        { regex: /.{8,}/, hint: "Використовуйте 8 або більше символів" },
        { regex: /\p{Ll}/u, hint: "Додайте малу літеру" },
        { regex: /\p{Lu}/u, hint: "Додайте велику літеру" },
        { regex: /\p{N}/u, hint: "Додайте цифру" },
    ];

    const checkStrength = (pass: string) => {
        return requirements.map((req) => ({
            met: req.regex.test(pass),
            hint: req.hint,
        }));
    };

    const strength = checkStrength(newPassword);
    const strengthScore = strength.filter((req) => req.met).length;
    const allMet = strengthScore === requirements.length;

    /* First unmet requirement — this is the smart hint */
    const firstUnmet = strength.find((req) => !req.met);

    const getStrengthColor = (score: number) => {
        if (score === 0) return "transparent";
        if (score <= 1) return "var(--destructive)";
        if (score <= 2) return "#f97316";
        if (score === 3) return "#eab308";
        return "var(--accent-success)";
    };

    const validateNewPasswords = (newVal: string, confVal: string) => {
        const currentStrength = checkStrength(newVal);
        const score = currentStrength.filter((req) => req.met).length;
        let isNewPassValid = false;

        if (newVal !== "") {
            if (score === requirements.length) {
                setNewPassStatus("success");
                setNewPassMsg("");
                isNewPassValid = true;
            } else {
                setNewPassStatus("error");
                setNewPassMsg("");
            }
        } else {
            setNewPassStatus("default");
            setNewPassMsg("");
        }

        if (confVal !== "") {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isNewEmpty = newPassword === "";
        const isConfEmpty = confirmPassword === "";
        const currentStrength = checkStrength(newPassword);
        const score = currentStrength.filter((req) => req.met).length;
        const isNewValid = !isNewEmpty && score === requirements.length;
        const isConfValid = !isConfEmpty && confirmPassword === newPassword && isNewValid;

        let hasError = false;
        let firstErrorRef: React.RefObject<HTMLInputElement | null> | null = null;

        if (isNewEmpty) {
            setNewPassStatus("error");
            setNewPassMsg("Обов\u2019язкове поле");
            hasError = true;
            if (!firstErrorRef) firstErrorRef = newPassRef;
        } else if (!isNewValid) {
            setNewPassStatus("error");
            setNewPassMsg("");
            hasError = true;
            if (!firstErrorRef) firstErrorRef = newPassRef;
        }

        if (isConfEmpty) {
            setConfPassStatus("error");
            setConfPassMsg("Обов\u2019язкове поле");
            hasError = true;
            if (!firstErrorRef) firstErrorRef = confPassRef;
        } else if (!isConfValid) {
            setConfPassStatus("error");
            setConfPassMsg("Паролі не співпадають");
            hasError = true;
            if (!firstErrorRef) firstErrorRef = confPassRef;
        }

        if (firstErrorRef) {
            firstErrorRef.current?.focus();
        } else {
            router.push("/");
        }
    };

    /* Show the smart hint when user has typed something AND password isn't fully valid */
    const showSmartHint = newPassword.length > 0 && !allMet;
    const showSuccessFeedback = newPassword.length > 0 && allMet;

    return (
        <>
            <div className="form-content-wrapper">
                <main className="main-content content-wide">
                    <div className="form-back-wrapper">
                        <BackNavigation />
                        <form className="login-container" onSubmit={handleSubmit}>
                            <h1 className="headline">СТВОРІТЬ НОВИЙ ПАРОЛЬ</h1>
                            <p className="subtitle">Введіть новий пароль і підтвердіть його</p>

                            <InputGroup
                                ref={newPassRef}
                                label="Новий пароль"
                                type="password"
                                name="newPassword"
                                autoComplete="new-password"
                                placeholder="…"
                                value={newPassword}
                                onChange={handleNewPassChange}
                                onBlur={() =>
                                    validateNewPasswords(newPassword, confirmPassword)
                                }
                                status={newPassStatus}
                                message={newPassMsg}
                                containerStyle={{ marginBottom: "8px" }}
                            />

                            {/* Password strength indicator — always visible when typing */}
                            <div
                                aria-label="Надійність пароля"
                                aria-valuemax={requirements.length}
                                aria-valuemin={0}
                                aria-valuenow={strengthScore}
                                role="progressbar"
                                tabIndex={-1}
                                className="strength-bar-track"
                                style={{
                                    marginTop: "0px",
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
                                        backgroundColor: newPassword
                                            ? getStrengthColor(strengthScore)
                                            : "transparent",
                                        transition: "width 500ms ease-out, background-color 500ms ease-out",
                                        width: `${(strengthScore / requirements.length) * 100}%`,
                                    }}
                                />
                            </div>

                            {/* Smart contextual hint — shows only the first unmet requirement */}
                            <div
                                className="smart-hint-wrapper"
                                style={{
                                    display: "grid",
                                    gridTemplateRows: showSmartHint ? "1fr" : "0fr",
                                    transition: "grid-template-rows 300ms ease-out",
                                }}
                            >
                                <div style={{ overflow: "hidden" }}>
                                    <div
                                        className="smart-hint"
                                        role="status"
                                        aria-live="polite"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            paddingTop: "10px",
                                            paddingBottom: "4px",
                                            fontSize: "13px",
                                            color: "var(--destructive)",
                                            fontWeight: 400,
                                        }}
                                    >
                                        <WarningCircle
                                            aria-hidden="true"
                                            size={16}
                                            weight="bold"
                                            style={{ flexShrink: 0 }}
                                        />
                                        <span>{firstUnmet?.hint}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Success feedback — shows when all requirements are met */}
                            <div
                                className="smart-hint-wrapper"
                                style={{
                                    display: "grid",
                                    gridTemplateRows: showSuccessFeedback ? "1fr" : "0fr",
                                    transition: "grid-template-rows 300ms ease-out",
                                }}
                            >
                                <div style={{ overflow: "hidden" }}>
                                    <div
                                        role="status"
                                        aria-live="polite"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            paddingTop: "10px",
                                            paddingBottom: "4px",
                                            fontSize: "13px",
                                            color: "var(--accent-success)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        <CheckCircle
                                            aria-hidden="true"
                                            size={16}
                                            weight="bold"
                                            style={{ flexShrink: 0 }}
                                        />
                                        <span>Надійний пароль</span>
                                    </div>
                                </div>
                            </div>

                            {/* Spacer between strength section and confirm field */}
                            <div style={{ height: (showSmartHint || showSuccessFeedback) ? "12px" : "20px", transition: "height 300ms ease-out" }} />

                            <InputGroup
                                ref={confPassRef}
                                label="Підтвердіть новий пароль"
                                type="password"
                                name="confirmPassword"
                                autoComplete="new-password"
                                placeholder="…"
                                value={confirmPassword}
                                onChange={handleConfPassChange}
                                onBlur={() =>
                                    validateNewPasswords(newPassword, confirmPassword)
                                }
                                status={confPassStatus}
                                message={confPassMsg}
                            />

                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ marginTop: 24 }}
                            >
                                Зберігти Пароль
                            </button>
                        </form>
                    </div>

                </main>
            </div>
        </>
    );
}
