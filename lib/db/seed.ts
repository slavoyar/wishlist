import { db, ensureSchema } from './index';
import { itemLinks, items } from './schema';

async function seed() {
  ensureSchema();

  const existing = await db.select().from(items).limit(1);
  if (existing.length > 0) {
    console.log('Database already has items, skipping seed.');
    return;
  }

  const now = new Date();

  const inserted = await db
    .insert(items)
    .values([
      {
        name: 'Механическая клавиатура Keychron Q1',
        imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80',
        notes: 'Для работы и комфортного набора текста.',
        price: 18990,
        currency: 'RUB',
        status: 'wanted',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Наушники Sony WH-1000XM5',
        imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
        notes: 'Шумодав для поездок и офиса.',
        price: 29990,
        currency: 'RUB',
        status: 'wanted',
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Книга «Clean Code»',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
        notes: 'Уже купил, оставляю как пример купленного.',
        price: 45,
        currency: 'USD',
        status: 'bought',
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .returning({ id: items.id });

  await db.insert(itemLinks).values([
    {
      itemId: inserted[0].id,
      label: 'Официальный сайт',
      url: 'https://www.keychron.com/',
      sortOrder: 0,
    },
    {
      itemId: inserted[0].id,
      label: 'Почему именно эта',
      url: 'https://www.reddit.com/r/MechanicalKeyboards/',
      sortOrder: 1,
    },
    {
      itemId: inserted[1].id,
      label: 'Sony',
      url: 'https://www.sony.com/',
      sortOrder: 0,
    },
    {
      itemId: inserted[2].id,
      label: 'Amazon',
      url: 'https://www.amazon.com/',
      sortOrder: 0,
    },
  ]);

  console.log('Seeded sample wishlist items.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
