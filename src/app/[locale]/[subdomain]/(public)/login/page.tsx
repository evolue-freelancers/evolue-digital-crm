"use client";

import { useTranslations } from "next-intl";

import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  const t = useTranslations("auth");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">{t("login")}</h1>
        <LoginForm />
      </div>
    </main>
  );
}
