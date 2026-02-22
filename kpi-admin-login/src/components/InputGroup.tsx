"use client";

import React, { useState } from "react";
import { Eye, EyeSlash, CheckCircle, WarningCircle } from "@phosphor-icons/react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    status?: "default" | "success" | "error";
    message?: string;
    requiredAsterisk?: boolean;
    hint?: React.ReactNode;
}

export function InputGroup({
    label,
    status = "default",
    message,
    requiredAsterisk = true,
    hint,
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.type === "password";

    const inputType = isPassword && showPassword ? "text" : props.type;

    return (
        <div className="input-group">
            <label>
                {label}
                {requiredAsterisk && <span className="required" style={{ color: status === 'success' ? 'var(--accent-success)' : status === 'error' ? 'var(--destructive)' : 'var(--destructive)' }}>*</span>}
            </label>
            <div className="input-wrapper">
                <input
                    {...props}
                    type={inputType}
                    className={`${props.className || ""} ${status === "success" ? "input-success" : status === "error" ? "input-error" : ""
                        }`}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="icon-btn"
                        aria-label="Toggle password visibility"
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
                <div className="input-status-area">
                    {status === "success" && message && (
                        <div className="status-text success">
                            <CheckCircle size={16} weight="bold" />
                            {message}
                        </div>
                    )}
                    {status === "error" && message && (
                        <div className="status-text error">
                            <WarningCircle size={16} weight="bold" />
                            {message}
                        </div>
                    )}
                </div>
                {hint && <div className="input-hint">{hint}</div>}
            </div>
        </div>
    );
}
