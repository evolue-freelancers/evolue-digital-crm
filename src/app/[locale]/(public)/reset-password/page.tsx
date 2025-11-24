"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ResetPasswordForm } from "./_components/reset-password-form";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Token inválido</h1>
            <p className="text-lg mb-8">
              O link de redefinição de senha é inválido ou expirou.
            </p>
            <Link href="/forgot-password">
              <Button>Solicitar novo link</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="z-10 max-w-md w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Senha redefinida</h1>
            <p className="text-lg mb-8">
              Sua senha foi redefinida com sucesso. Redirecionando...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-8 text-center">
          {t("resetPassword")}
        </h1>
        <ResetPasswordForm onSuccess={() => setSuccess(true)} />
      </div>
    </main>
  );
}
