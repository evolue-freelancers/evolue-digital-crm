import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/send";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
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
      sendChangeEmailVerification: async ({ newEmail, url }) => {
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

export type Session = typeof auth.$Infer.Session;
