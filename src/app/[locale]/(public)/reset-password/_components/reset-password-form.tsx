"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { RouterInputs } from "@/server/routers/_app";
import { trpc } from "@/trpc/client";
import { resetPasswordFormSchema } from "@/validations/auth";

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

// Tipo inferido do tRPC para garantir compatibilidade
type ResetPasswordInput = RouterInputs["auth"]["resetPassword"];

type ResetPasswordFormProps = {
  onSuccess?: () => void;
};

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso!");
      onSuccess?.();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao redefinir senha");
    },
  });

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Token inválido");
      return;
    }

    const input: ResetPasswordInput = {
      token,
      newPassword: data.password,
    };
    resetPasswordMutation.mutate(input);
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Token inválido</h1>
        <p className="text-lg mb-8">
          O link de redefinição de senha é inválido ou expirou.
        </p>
        <Link href="/forgot-password">
          <Button>Solicitar novo link</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("confirmPassword")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full"
          >
            {resetPasswordMutation.isPending
              ? tCommon("loading")
              : t("resetPassword")}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline">
          {t("backToLogin")}
        </Link>
      </div>
    </>
  );
}
