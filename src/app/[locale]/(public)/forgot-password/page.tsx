"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ForgotPasswordForm } from "./_components/forgot-password-form";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Email enviado</h1>
            <p className="text-lg mb-8">
              Verifique sua caixa de entrada para redefinir sua senha.
            </p>
            <Link href="/login">
              <Button>{t("backToLogin")}</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t("forgotPassword")}
        </h1>
        <ForgotPasswordForm onSuccess={() => setSuccess(true)} />
      </div>
    </main>
  );
}
