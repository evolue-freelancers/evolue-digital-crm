"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function UnauthorizedPage() {
  const t = useTranslations("errors.unauthorized");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-red-600">{t("title")}</h1>
        <p className="text-lg mb-8 text-gray-600">{t("message")}</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {t("goBack")}
          </Link>
          <Link
            href="/api/auth/signout"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            {t("logout")}
          </Link>
        </div>
      </div>
    </main>
  );
}
