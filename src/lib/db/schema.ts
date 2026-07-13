import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Enums
export const projectCategoryEnum = pgEnum('project_category', [
  'completed',
  'running',
  'upcoming',
]);

export const projectTypeEnum = pgEnum('project_type', [
  'plot',
  'flat_1bhk',
  'flat_2bhk',
  'flat_3bhk',
  'duplex',
  'row_house',
]);

export const mediaTypeEnum = pgEnum('media_type', ['image', 'video']);

export const brokerStatusEnum = pgEnum('broker_status', ['active', 'blocked']);

export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'converted',
]);

export const commissionStatusEnum = pgEnum('commission_status', [
  'pending',
  'paid',
]);

export const withdrawalStatusEnum = pgEnum('withdrawal_status', [
  'pending',
  'approved',
  'paid',
  'rejected',
]);

// Tables
export const usersAdmin = pgTable('users_admin', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const brokers = pgTable('brokers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 255 }),
  mobile: varchar('mobile', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  address: text('address'),
  bankName: varchar('bank_name', { length: 255 }),
  accountNo: varchar('account_no', { length: 50 }),
  upiId: varchar('upi_id', { length: 100 }),
  profilePhotoUrl: text('profile_photo_url'),
  profilePhotoPublicId: text('profile_photo_public_id'),
  affiliateCode: varchar('affiliate_code', { length: 20 }).notNull().unique(),
  status: brokerStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  category: projectCategoryEnum('category').notNull(),
  type: projectTypeEnum('type').notNull(),
  description: text('description'),
  priceRange: varchar('price_range', { length: 100 }),
  location: varchar('location', { length: 255 }),
  amenities: text('amenities').array(),
  coverImageUrl: text('cover_image_url'),
  coverImagePublicId: text('cover_image_public_id'),
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true).notNull(),
  mapEmbedUrl: text('map_embed_url'),
  bhkOptions: text('bhk_options'),
  specifications: text('specifications'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectMedia = pgTable('project_media', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  publicId: text('public_id').notNull(),
  mediaType: mediaTypeEnum('media_type').default('image').notNull(),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const galleryMedia = pgTable('gallery_media', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  publicId: text('public_id').notNull(),
  mediaType: mediaTypeEnum('media_type').default('image').notNull(),
  albumTag: varchar('album_tag', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  contactNo: varchar('contact_no', { length: 20 }).notNull(),
  residence: text('residence'),
  projectId: integer('project_id').references(() => projects.id),
  brokerId: integer('broker_id').references(() => brokers.id),
  status: leadStatusEnum('status').default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commissions = pgTable('commissions', {
  id: serial('id').primaryKey(),
  brokerId: integer('broker_id')
    .references(() => brokers.id)
    .notNull(),
  projectId: integer('project_id')
    .references(() => projects.id)
    .notNull(),
  leadId: integer('lead_id')
    .references(() => leads.id)
    .notNull()
    .unique(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: commissionStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const withdrawalRequests = pgTable('withdrawal_requests', {
  id: serial('id').primaryKey(),
  brokerId: integer('broker_id')
    .references(() => brokers.id)
    .notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: withdrawalStatusEnum('status').default('pending').notNull(),
  note: text('note'),
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
});

export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  callNumber: varchar('call_number', { length: 30 }).default('+91-XXXXXXXXXX'),
  whatsappNumber: varchar('whatsapp_number', { length: 30 }).default('+91XXXXXXXXXX'),
  aboutContent: text('about_content').default(''),
  privacyContent: text('privacy_content').default(''),
  termsContent: text('terms_content').default(''),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Type exports
export type UserAdmin = typeof usersAdmin.$inferSelect;
export type NewUserAdmin = typeof usersAdmin.$inferInsert;
export type Broker = typeof brokers.$inferSelect;
export type NewBroker = typeof brokers.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectMedia = typeof projectMedia.$inferSelect;
export type GalleryMedia = typeof galleryMedia.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Commission = typeof commissions.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
