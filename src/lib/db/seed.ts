import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  // Seed admin
  const existingAdmin = await db
    .select()
    .from(schema.usersAdmin)
    .limit(1);

  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash('Admin@123', 12);
    await db.insert(schema.usersAdmin).values({
      email: 'admin@creativegroup.in',
      passwordHash: hash,
      name: 'Admin',
    });
    console.log('✅ Admin created: admin@creativegroup.in / Admin@123');
  } else {
    console.log('⏭️  Admin already exists, skipping.');
  }

  // Seed site settings
  const existingSettings = await db
    .select()
    .from(schema.siteSettings)
    .limit(1);

  if (existingSettings.length === 0) {
    await db.insert(schema.siteSettings).values({
      callNumber: '+91-XXXXXXXXXX',
      whatsappNumber: '+91XXXXXXXXXX',
      aboutContent:
        '# About Creative Group\n\nCreative Group is a premier real estate developer based in Gwalior, MP. We specialize in Residential Plot Projects, Flats (1/2/3 BHK), Duplex & Row Houses — premium quality at affordable prices.\n\n**Best & Affordable Prices | Premium Development | First Time in Gwalior**',
      privacyContent:
        '# Privacy Policy\n\nYour privacy is important to us. This policy explains how Creative Group collects, uses, and protects your information.',
      termsContent:
        '# Terms & Conditions\n\nBy accessing our website, you agree to these terms and conditions. Please read them carefully.',
    });
    console.log('✅ Site settings seeded.');
  } else {
    console.log('⏭️  Site settings already exist, skipping.');
  }

  console.log('🎉 Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
