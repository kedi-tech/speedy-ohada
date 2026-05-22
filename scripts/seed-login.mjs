import 'dotenv/config';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

try {
  await client.query('begin');

  await client.query(`
    insert into "Organization" ("id", "name", "plan", "status", "adminEmail", "createdAt", "updatedAt")
    values ('org_speedy_ohada', 'Speedy OHADA', 'enterprise', 'active', 'sleekhub@gmail.com', now(), now())
    on conflict ("id") do update set
      "name" = excluded."name",
      "plan" = excluded."plan",
      "status" = excluded."status",
      "adminEmail" = excluded."adminEmail",
      "updatedAt" = now()
  `);

  await client.query('commit');
  console.log('✓ Organization : org_speedy_ohada');
} catch (error) {
  await client.query('rollback').catch(() => {});
  throw error;
} finally {
  await client.end();
}
