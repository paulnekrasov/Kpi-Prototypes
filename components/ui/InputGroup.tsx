"use client";

import React, { useState, useId, forwardRef } from "react";
import { Eye, EyeSlash, CheckCircle, WarningCircle } from "@phosphor-icons/react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    status?: "default" | "success" | "error";
    message?: string;
    requiredAsterisk?: boolean;
    hint?: React.ReactNode;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
}

export const InputGroup = forwardRef<HTMLInputElement, InputProps>(
    function InputGroup({
        label,
        status = "default",
        message,
        requiredAsterisk = true,
        hint,
        containerStyle,
        containerClassName,
        ...props
    }, ref) {
        const defaultId = useId();
        const elementId = props.id || defaultId;
        const statusId = `${elementId}-status`;
        const hintId = `${elementId}-hint`;
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = props.type === "password";
        const shouldDisableSpellcheck = props.type === "email" || props.type === "password";
        const passwordToggleLabel = showPassword ? "Приховати пароль" : "Показати пароль";

        const inputType = isPassword && showPassword ? "text" : props.type;
        const describedBy = [
            props["aria-describedby"],
            hint ? hintId : undefined,
            message && status !== "default" ? statusId : undefined,
        ].filter(Boolean).join(" ") || undefined;

        return (
            <div className={`input-group ${containerClassName || ""}`} style={containerStyle}>
                <label htmlFor={elementId}>
                    {label}
                    {requiredAsterisk && props.required ? (
                        <span
                            aria-hidden="true"
                            style={status === "success" ? { color: "var(--color-success)" } : undefined}
                        > *</span>
                    ) : null}
                </label>
                <div className="input-wrapper">
                    <input
                        ref={ref}
                        id={elementId}
                        {...props}
                        type={inputType}
                        spellCheck={shouldDisableSpellcheck ? false : undefined}
                        aria-describedby={describedBy}
                        className={`${props.className || ""} ${status === "success" ? "input-success" : status === "error" ? "input-error" : ""
                            }`}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            className="icon-btn"
                            aria-label={passwordToggleLabel}
                            aria-pressed={showPassword}
                            title={passwordToggleLabel}
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <span className="icon-btn-icons" aria-hidden="true">
                                <Eye
                                    size={20}
                                    weight="bold"
                                    className={showPassword ? "icon-hidden" : "icon-visible"}
                                />
                                <EyeSlash
                                    size={20}
                                    weight="bold"
                                    className={showPassword ? "icon-visible" : "icon-hidden"}
                                />
                            </span>
                        </button>
                    )}
                </div>
                <div className="input-footer">
                    <div className="input-status-area" id={statusId} aria-live="polite">
                        {status === "success" && message && (
                            <div className="status-text success">
                                <CheckCircle size={16} weight="bold" aria-hidden="true" />
                                {message}
                            </div>
                        )}
                        {status === "error" && message && (
                            <div className="status-text error">
                                <WarningCircle size={16} weight="bold" aria-hidden="true" />
                                {message}
                            </div>
                        )}
                    </div>
                    {hint && <div className="input-hint" id={hintId}>{hint}</div>}
                </div>
            </div>
        );
    }
);
