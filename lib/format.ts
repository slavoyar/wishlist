export function formatPrice(price: number | null | undefined, currency: string | null | undefined) {
  if (price == null) return null;
  const code = currency || 'RUB';
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'RUB' ? 0 : 2,
    }).format(price);
  } catch {
    return `${price} ${code}`;
  }
}
