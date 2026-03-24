"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { InputGroup } from "@components/ui/InputGroup";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  const [emailStatus, setEmailStatus] = useState<"default" | "success" | "error">("default");
  const [emailMsg, setEmailMsg] = useState("");

  const [passStatus, setPassStatus] = useState<"default" | "success" | "error">("default");
  const [passMsg, setPassMsg] = useState("");

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

  const validatePassword = (val: string) => {
    setPassword(val);
    if (val.trim() !== '') {
      if (val.length >= 6) {
        setPassStatus("default");
        setPassMsg("");
      } else {
        setPassStatus("error");
        setPassMsg("Пароль надто короткий (мін. 6 символів)");
      }
    } else {
      setPassStatus("default");
      setPassMsg("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailEmpty = email.trim() === "";
    const isEmailValid = !isEmailEmpty && validateEmailFormat(email);
    const isPassEmpty = password.trim() === "";
    const isPassValid = !isPassEmpty && password.length >= 6;

    let firstErrorRef: React.RefObject<HTMLInputElement | null> | null = null;

    if (isEmailEmpty) {
      setEmailStatus("error");
      setEmailMsg("Обов'язкове поле");
      if (!firstErrorRef) firstErrorRef = emailRef;
    } else if (!isEmailValid) {
      setEmailStatus("error");
      setEmailMsg("Недійсний email");
      if (!firstErrorRef) firstErrorRef = emailRef;
    }

    if (isPassEmpty) {
      setPassStatus("error");
      setPassMsg("Обов'язкове поле");
      if (!firstErrorRef) firstErrorRef = passRef;
    } else if (!isPassValid) {
      setPassStatus("error");
      setPassMsg("Пароль надто короткий (мін. 6 символів)");
      if (!firstErrorRef) firstErrorRef = passRef;
    }

    if (firstErrorRef) {
      firstErrorRef.current?.focus();
    }
  };

  return (
    <>
      <div className="form-content-wrapper">
        <main className="main-content">
          <form className="login-container" onSubmit={handleSubmit}>
            <h1 className="headline">ПАНЕЛЬ СР КПІ</h1>

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

            <InputGroup
              ref={passRef}
              label="Пароль"
              type="password"
              name="password"
              placeholder="…"
              autoComplete="current-password"
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              onBlur={() => validatePassword(password)}
              status={passStatus}
              message={passMsg}
              hint={<Link href="/forgot-password" className="forgot-password">Забули Пароль?</Link>}
            />

            <button type="submit" className="btn-primary btn-full" style={{ marginTop: 16 }}>Увійти у панель</button>

            <div className="divider">
              <span className="line"></span>
              <span className="text">АБО</span>
              <span className="line"></span>
            </div>

            <button type="button" className="btn-secondary btn-full">
              <Image src="/Google.svg" alt="" aria-hidden="true" width={20} height={20} unoptimized />
              Увійти з Google
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
