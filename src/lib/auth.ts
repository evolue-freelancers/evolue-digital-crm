import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/send";
import { getBaseDomain } from "@/lib/utils";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [admin()],
  trustedOrigins: (request: Request) => {
    const origin = request.headers.get("origin");
    if (!origin) return [];

    const baseDomain = getBaseDomain();
    const port = process.env.NODE_ENV === "development" ? ":3000" : "";
    const baseDomainWithPort = `${baseDomain}${port}`;

    // Permite URLs da Vercel (preview e produção)
    if (
      origin.includes(".vercel.app") ||
      origin.includes(".vercel.app/") ||
      origin.endsWith(".vercel.app")
    ) {
      return [origin];
    }

    // Permite app.{baseDomain} (plataforma/admin) - HTTP ou HTTPS
    if (
      origin === `http://app.${baseDomainWithPort}` ||
      origin === `https://app.${baseDomain}`
    ) {
      return [origin];
    }

    // Permite qualquer subdomínio do baseDomain (tenants) - HTTP ou HTTPS
    if (
      (origin.startsWith("http://") &&
        origin.endsWith(`.${baseDomainWithPort}`)) ||
      (origin.startsWith("https://") && origin.endsWith(`.${baseDomain}`))
    ) {
      return [origin];
    }

    return [];
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.SKIP_EMAIL_VERIFICATION !== "true",
  },
  forgotPassword: {
    enabled: true,
    sendResetEmail: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      await sendEmail({
        to: user.email,
        subject: "Redefinir senha",
        html: `
          <h1>Redefinir senha</h1>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="${url}">Redefinir senha</a>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p>${url}</p>
          <p>Este link expira em 1 hora.</p>
        `,
        text: `Clique no link para redefinir sua senha: ${url}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: { email: string };
      url: string;
    }) => {
      await sendEmail({
        to: user.email,
        subject: "Verifique seu email",
        html: `
          <h1>Bem-vindo!</h1>
          <p>Clique no link abaixo para verificar seu email:</p>
          <a href="${url}">Verificar email</a>
          <p>Ou copie e cole este link no seu navegador:</p>
          <p>${url}</p>
          <p>Este link expira em 1 hora.</p>
        `,
        text: `Clique no link para verificar seu email: ${url}`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        newEmail,
        url,
      }: {
        newEmail: string;
        url: string;
      }) => {
        await sendEmail({
          to: newEmail,
          subject: "Confirme sua mudança de email",
          html: `
            <h1>Confirme sua mudança de email</h1>
            <p>Clique no link abaixo para confirmar sua mudança de email:</p>
            <a href="${url}">Confirmar mudança de email</a>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p>${url}</p>
          `,
          text: `Clique no link para confirmar sua mudança de email: ${url}`,
        });
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;
