import { ROLES } from "../src/constants/roles";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

/**
 * Limpa todas as tabelas do banco de dados
 * Ordem respeitando foreign keys
 */
async function cleanDatabase() {
  console.log("🧹 Limpando banco de dados...");

  // Ordem de deleção respeitando foreign keys
  await prisma.tenantMember.deleteMany();
  console.log("   ✅ TenantMember limpo");

  await prisma.domain.deleteMany();
  console.log("   ✅ Domain limpo");

  await prisma.session.deleteMany();
  console.log("   ✅ Session limpo");

  await prisma.account.deleteMany();
  console.log("   ✅ Account limpo");

  await prisma.verification.deleteMany();
  console.log("   ✅ Verification limpo");

  await prisma.tenant.deleteMany();
  console.log("   ✅ Tenant limpo");

  await prisma.user.deleteMany();
  console.log("   ✅ User limpo");

  console.log("✅ Banco de dados limpo com sucesso!");
}

/**
 * Cria um usuário usando Better Auth
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @param name - Nome do usuário
 * @param role - Role do usuário (opcional)
 * @param emailVerified - Se o email está verificado (padrão: true)
 * @returns Usuário criado
 */
async function createUser({
  email,
  password,
  name,
  role,
  emailVerified = true,
}: {
  email: string;
  password: string;
  name: string;
  role?: string;
  emailVerified?: boolean;
}) {
  console.log(`📝 Criando usuário: ${email}...`);

  // Cria o usuário usando Better Auth
  const result = await auth.api.createUser({
    body: {
      email,
      password,
      name,
    },
  });

  if (!result?.user) {
    throw new Error(`Falha ao criar usuário: ${email}`);
  }

  const user = result.user;

  // Atualiza campos adicionais
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified,
      ...(role && { role }),
    },
  });

  console.log(`✅ Usuário criado: ${user.email}${role ? ` (${role})` : ""}`);

  return user;
}

async function main() {
  console.log("🌱 Iniciando seed...\n");

  // Limpa o banco de dados
  await cleanDatabase();
  console.log("");

  // Cria o usuário admin do sistema
  await createUser({
    email: "admin@example.com",
    password: "Teste123@",
    name: "Admin",
    role: ROLES.SUPERADMIN,
    emailVerified: true,
  });

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("\n📋 Credenciais de acesso:");
  console.log("   Email: admin@example.com");
  console.log("   Senha: Teste123@");
  console.log("   Role: superadmin");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
