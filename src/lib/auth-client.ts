"use client";

import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Usa URL relativa para evitar problemas de CORS
// O Better Auth detecta automaticamente a URL base da aplicação
export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [adminClient()],
});
