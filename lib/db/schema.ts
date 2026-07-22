import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  notes: text('notes'),
  price: real('price'),
  currency: text('currency', { enum: ['RUB', 'USD', 'EUR'] }).default('RUB'),
  status: text('status', { enum: ['wanted', 'bought'] }).notNull().default('wanted'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const itemLinks = sqliteTable('item_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export type Item = typeof items.$inferSelect;
export type ItemLink = typeof itemLinks.$inferSelect;
export type Currency = NonNullable<Item['currency']>;
export type ItemStatus = Item['status'];
