"use client";

import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    status?: "default" | "success" | "error";
    message?: string;
    requiredAsterisk?: boolean;
}

export function InputGroup({
    label,
    status = "default",
    message,
    requiredAsterisk = true,
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
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {status === "success" && message && (
                <div className="status-text success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {message}
                </div>
            )}
            {status === "error" && message && (
                <div className="status-text error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {message}
                </div>
            )}
        </div>
    );
}
