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
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = props.type === "password";
        const shouldDisableSpellcheck = props.type === "email" || props.type === "password";

        const inputType = isPassword && showPassword ? "text" : props.type;

        return (
            <div className={`input-group ${containerClassName || ""}`} style={containerStyle}>
                <label htmlFor={elementId}>
                    {label}
                </label>
                <div className="input-wrapper">
                    <input
                        ref={ref}
                        id={elementId}
                        {...props}
                        type={inputType}
                        spellCheck={shouldDisableSpellcheck ? false : undefined}
                        aria-describedby={message ? statusId : undefined}
                        className={`${props.className || ""} ${status === "success" ? "input-success" : status === "error" ? "input-error" : ""
                            }`}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            className="icon-btn"
                            aria-label="Показати/приховати пароль"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeSlash size={20} weight="bold" />
                            ) : (
                                <Eye size={20} weight="bold" />
                            )}
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
                    {hint && <div className="input-hint">{hint}</div>}
                </div>
            </div>
        );
    }
);
