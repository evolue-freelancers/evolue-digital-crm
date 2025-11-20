import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  PERMISSION_DESCRIPTIONS,
  PERMISSIONS,
  ROLE_PERMISSIONS,
} from "../src/constants/permissions";
import { ROLE_DESCRIPTIONS, ROLES } from "../src/constants/roles";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function cleanDatabase() {
  console.log("🧹 Cleaning database...");

  await prisma.rolePermission.deleteMany();
  console.log("  ✓ Deleted role_permissions");

  await prisma.userRole.deleteMany();
  console.log("  ✓ Deleted user_roles");

  await prisma.account.deleteMany();
  console.log("  ✓ Deleted accounts");

  await prisma.session.deleteMany();
  console.log("  ✓ Deleted sessions");

  await prisma.verificationToken.deleteMany();
  console.log("  ✓ Deleted verification_tokens");

  await prisma.user.deleteMany();
  console.log("  ✓ Deleted users");

  await prisma.role.deleteMany();
  console.log("  ✓ Deleted roles");

  await prisma.permission.deleteMany();
  console.log("  ✓ Deleted permissions");

  console.log("✅ Database cleaned successfully");
}

async function createPermissions() {
  console.log("🔐 Creating permissions...");

  const permissionsData = Object.values(PERMISSIONS).map((name) => {
    const [resource, action] = name.split(":");
    return {
      name,
      description: PERMISSION_DESCRIPTIONS[name],
      resource,
      action,
    };
  });

  for (const permissionData of permissionsData) {
    await prisma.permission.create({
      data: permissionData,
    });
  }

  console.log(`✅ Created ${permissionsData.length} permissions`);
}

async function createRoles() {
  console.log("📝 Creating roles...");

  const rolesData = Object.values(ROLES).map((name) => ({
    name,
    description: ROLE_DESCRIPTIONS[name],
  }));

  for (const roleData of rolesData) {
    await prisma.role.create({
      data: roleData,
    });
  }

  console.log(`✅ Created ${rolesData.length} roles`);
}

async function createRolePermissions() {
  console.log("🔗 Creating role-permission mappings...");

  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();

  const permissionMap = new Map(permissions.map((p) => [p.name, p.id]));

  let rolePermissionCount = 0;

  for (const role of roles) {
    const rolePermissions = ROLE_PERMISSIONS[role.name] || [];

    for (const permissionName of rolePermissions) {
      const permissionId = permissionMap.get(permissionName);

      if (permissionId) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId,
          },
        });
        rolePermissionCount++;
      }
    }
  }

  console.log(`✅ Created ${rolePermissionCount} role-permission mappings`);
}

async function createUser(data: {
  email: string;
  name?: string;
  emailVerified?: boolean;
  image?: string;
}) {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      emailVerified: data.emailVerified ?? false,
      image: data.image,
    },
  });

  return user;
}

async function createSuperAdmin(data: {
  email: string;
  name?: string;
  emailVerified?: boolean;
  image?: string;
}) {
  console.log("👤 Creating superadmin user...");

  const superAdminRole = await prisma.role.findUnique({
    where: { name: ROLES.SUPERADMIN },
  });

  if (!superAdminRole) {
    throw new Error(
      "Superadmin role not found. Make sure roles are created first."
    );
  }

  const user = await createUser({
    email: data.email,
    name: data.name,
    emailVerified: data.emailVerified ?? true,
    image: data.image,
  });

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: superAdminRole.id,
    },
  });

  console.log(`✅ Created superadmin user: ${user.email}`);

  return user;
}

async function main() {
  console.log("🌱 Starting seed...");

  try {
    await cleanDatabase();
    await createPermissions();
    await createRoles();
    await createRolePermissions();
    await createSuperAdmin({
      email: "admin@evolue.com",
      name: "Super Admin",
      emailVerified: true,
    });

    console.log("🎉 Seed completed successfully!");
  } catch (error) {
    console.error("❌ Error during seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
