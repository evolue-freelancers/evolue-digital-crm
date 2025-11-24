"use client";

import { useTranslations } from "next-intl";

import { SuperAdminOnly } from "@/components/superadmin-only";
import { TenantAdminOnly } from "@/components/tenant-admin-only";

import { LogoutButton } from "./_components/logout-button";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold">{t("title")}</h1>
          <LogoutButton />
        </div>
        <p className="text-lg mb-8">{t("welcome")}</p>

        {/* Teste de visibilidade - Superadmin Only */}
        <SuperAdminOnly>
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg border-2 border-green-500">
            <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
              🔒 Visível apenas para Superadmin
            </h2>
            <p className="text-green-700 dark:text-green-300">
              Este componente só é visível quando você está logado como
              superadmin no modo plataforma (app.
              {typeof window !== "undefined"
                ? window.location.hostname.split(".").slice(-2).join(".")
                : "evolue.com.br"}
              ).
            </p>
          </div>
        </SuperAdminOnly>

        {/* Teste de visibilidade - Tenant Admin Only */}
        <TenantAdminOnly>
          <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg border-2 border-blue-500">
            <h2 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
              🔒 Visível apenas para Admin do Tenant
            </h2>
            <p className="text-blue-700 dark:text-blue-300">
              Este componente só é visível quando você está logado como admin de
              um tenant. Membros (members) não conseguem ver este conteúdo.
            </p>
          </div>
        </TenantAdminOnly>
      </div>
    </main>
  );
}
