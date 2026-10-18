import type { ShoppingItem } from '../types/ShoppingItem'

export function normalizeProductName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

// Média dos preços unitários conhecidos, para o mesmo produto e unidade.
export function getHistoricalAverage(
  items: ShoppingItem[], name: string, unit: string
): number | null {
  const prices = items.filter((item) =>
    normalizeProductName(item.name) === normalizeProductName(name) &&
    item.unit === unit &&
    item.unitPrice != null && Number.isFinite(item.unitPrice) && item.unitPrice >= 0
  ).map((item) => item.unitPrice as number)

  if (!prices.length) return null
  return prices.reduce((sum, price) => sum + price, 0) / prices.length
}

export const formatMoney = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
