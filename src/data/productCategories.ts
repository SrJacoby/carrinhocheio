import type { ProductCategory } from '../types/ProductCategory'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  hortifruti: 'Hortifruti',
  laticinios: 'Laticínios',
  carnes: 'Carnes',
  padaria: 'Padaria',
  limpeza: 'Limpeza',
  outros: 'Outros'
}

export const CATEGORY_ORDER: ProductCategory[] = [
  'hortifruti',
  'laticinios',
  'carnes',
  'padaria',
  'limpeza',
  'outros'
]

export const CATEGORY_OPTIONS = CATEGORY_ORDER.map((value) => ({
  value,
  label: CATEGORY_LABELS[value]
}))
