"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function SuspendedPage() {
  const t = useTranslations("errors.tenantSuspended");
  const tCommon = useTranslations("common");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-yellow-600">
          {t("title")}
        </h1>
        <p className="text-lg mb-8 text-gray-600">{t("message")}</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {tCommon("back")}
          </Link>
          <a
            href="mailto:support@evolue.com.br"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {t("contactSupport")}
          </a>
        </div>
      </div>
    </main>
  );
}
