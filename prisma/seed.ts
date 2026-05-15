import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { name: 'users:create', description: 'Create users' },
  { name: 'users:read', description: 'View users' },
  { name: 'users:update', description: 'Update users' },
  { name: 'users:delete', description: 'Delete users' },
  { name: 'roles:create', description: 'Create roles' },
  { name: 'roles:read', description: 'View roles' },
  {
    name: 'roles:update',
    description: 'Update roles and assign permissions/users',
  },
  { name: 'roles:delete', description: 'Delete roles' },
  { name: 'permissions:create', description: 'Create permissions' },
  { name: 'permissions:read', description: 'View permissions' },
  { name: 'permissions:delete', description: 'Delete permissions' },
  { name: 'finance:create', description: 'Create transactions' },
  { name: 'finance:read', description: 'View transactions' },
  { name: 'finance:update', description: 'Update transactions' },
  { name: 'finance:delete', description: 'Delete transactions' },
];

const ROLES = [
  {
    name: 'admin',
    description: 'Full access to all resources',
    permissions: PERMISSIONS.map((p) => p.name),
  },
  {
    name: 'user',
    description: 'Standard user with access to their own finances',
    permissions: [
      'finance:create',
      'finance:read',
      'finance:update',
      'finance:delete',
    ],
  },
];

async function main() {
  console.log('Seeding permissions...');
  const permMap: Record<string, string> = {};
  for (const perm of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
    permMap[p.name] = p.id;
  }

  console.log('Seeding roles...');
  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description },
      create: { name: roleDef.name, description: roleDef.description },
    });

    for (const permName of roleDef.permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permMap[permName],
          },
        },
        update: {},
        create: { roleId: role.id, permissionId: permMap[permName] },
      });
    }
  }

  console.log('Seeding admin user...');
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { name: 'admin' },
  });
  const hashedPassword = await bcrypt.hash('Admin@1234', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@finora.app' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@finora.app',
      password: hashedPassword,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log('Done.');
  console.log('Admin credentials: admin@finora.app / Admin@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
