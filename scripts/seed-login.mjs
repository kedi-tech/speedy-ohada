import 'dotenv/config';
import { createHash, randomBytes } from 'node:crypto';
import pg from 'pg';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

try {
  await client.query('begin');
  await client.query(
    `
      insert into "Organization" ("id", "name", "plan", "status", "adminEmail", "createdAt", "updatedAt")
      values ('org_speedy_ohada', 'Speedy OHADA', 'enterprise', 'active', 'sleekhub@gmail.com', now(), now())
      on conflict ("id") do update set
        "name" = excluded."name",
        "plan" = excluded."plan",
        "status" = excluded."status",
        "adminEmail" = excluded."adminEmail",
        "updatedAt" = now()
    `,
  );
  await client.query(
    `
      insert into "User" ("id", "email", "hashedPassword", "name", "role", "org", "initials", "status", "organizationId", "createdAt", "updatedAt")
      values ('user_sleekhub_admin', $1, $2, 'Sleekhub Admin', 'super_admin', 'Speedy OHADA', 'SA', 'active', 'org_speedy_ohada', now(), now())
      on conflict ("email") do update set
        "hashedPassword" = excluded."hashedPassword",
        "name" = excluded."name",
        "role" = excluded."role",
        "org" = excluded."org",
        "initials" = excluded."initials",
        "status" = excluded."status",
        "organizationId" = excluded."organizationId",
        "updatedAt" = now()
    `,
    ['sleekhub@gmail.com', hashPassword('Sleekhub@123')],
  );
  await client.query('commit');
  console.log('Seeded login user: sleekhub@gmail.com');
} catch (error) {
  await client.query('rollback').catch(() => {});
  throw error;
} finally {
  await client.end();
}
