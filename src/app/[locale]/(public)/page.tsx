import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/language-switcher";
import { resolveSubdomainFromHeaders } from "@/lib/resolve-subdomain-from-headers";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  const subdomain = await resolveSubdomainFromHeaders();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="mb-8 flex justify-end">
          <LanguageSwitcher />
        </div>
        <div className="mb-8 flex justify-center">
          <h1 className="text-4xl font-bold">{subdomain}</h1>
        </div>
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-lg mb-8">{t("description")}</p>
        <div className="text-center">
          <p className="text-xl">{tCommon("welcome")}</p>
        </div>
      </div>
    </main>
  );
}
