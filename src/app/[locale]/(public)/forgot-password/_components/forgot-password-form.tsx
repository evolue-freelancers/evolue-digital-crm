"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { forgotPasswordFormSchema } from "@/validations/auth";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

type ForgotPasswordFormProps = {
  onSuccess?: () => void;
};

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      toast.success(
        "Email de redefinição enviado! Verifique sua caixa de entrada."
      );
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar email");
    },
  });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    const input: RouterInputs["auth"]["forgotPassword"] = {
      email: data.email,
      redirectTo: `${window.location.origin}/reset-password`,
    };
    forgotPasswordMutation.mutate(input);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full"
          >
            {forgotPasswordMutation.isPending
              ? tCommon("loading")
              : t("sendResetLink")}
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
