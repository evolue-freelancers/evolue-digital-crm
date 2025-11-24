"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const t = useTranslations("auth");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      // Mesmo em caso de erro, redireciona para login
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      {t("logout")}
    </Button>
  );
}
