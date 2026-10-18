import type { ShoppingList } from '../types/ShoppingList'
import type { ShoppingItem } from '../types/ShoppingItem'
import type { CatalogProduct } from '../types/CatalogProduct'
import { initialCatalog } from '../data/initialCatalog'

export const LISTS_STORAGE_KEY = 'carrinhocheio_lists'
export const ITEMS_STORAGE_KEY = 'carrinhocheio_items'
export const CATALOG_STORAGE_KEY = 'carrinhocheio_catalog'

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Não foi possível salvar ${key}:`, error)
  }
}

export function loadLists(): ShoppingList[] {
  try {
    const saved = localStorage.getItem(LISTS_STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (list) =>
          typeof list === 'object' &&
          list !== null &&
          typeof list.id === 'string' &&
          typeof list.name === 'string'
      )
    ) return []

    return (parsed as ShoppingList[]).map((list) => ({
      ...list,
      budget:
        typeof list.budget === 'number' &&
        Number.isFinite(list.budget) &&
        list.budget >= 0
          ? list.budget
          : null
    }))
  } catch {
    return []
  }
}

export function loadItems(): ShoppingItem[] {
  try {
    const saved = localStorage.getItem(ITEMS_STORAGE_KEY)
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.listId === 'string' &&
          typeof item.name === 'string' &&
          typeof item.quantity === 'number' &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0 &&
          typeof item.unit === 'string' &&
          typeof item.checked === 'boolean'
      )
    ) return []

    return (parsed as ShoppingItem[]).map((item) => ({
      ...item,
      category: (
        item.category === 'hortifruti' ||
        item.category === 'laticinios' ||
        item.category === 'carnes' ||
        item.category === 'padaria' ||
        item.category === 'limpeza' ||
        item.category === 'outros'
      ) ? item.category : 'outros',
      unitPrice:
        typeof item.unitPrice === 'number' &&
        Number.isFinite(item.unitPrice) &&
        item.unitPrice >= 0
          ? item.unitPrice
          : null
    }))
  } catch {
    return []
  }
}

export function loadCatalog(): CatalogProduct[] {
  try {
    const saved = localStorage.getItem(CATALOG_STORAGE_KEY)
    if (saved === null) return initialCatalog

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return initialCatalog

    const categories = [
      'hortifruti', 'laticinios', 'carnes',
      'padaria', 'limpeza', 'outros'
    ]

    const valid = parsed.every(
      (product) =>
        typeof product === 'object' &&
        product !== null &&
        typeof product.id === 'string' &&
        typeof product.name === 'string' &&
        typeof product.defaultUnit === 'string' &&
        typeof product.category === 'string' &&
        categories.includes(product.category)
    )

    return valid ? (parsed as CatalogProduct[]).map((product) => ({
      ...product,
      unitPrice: typeof product.unitPrice === 'number' &&
        Number.isFinite(product.unitPrice) && product.unitPrice >= 0
          ? product.unitPrice : null
    })) : initialCatalog
  } catch {
    return initialCatalog
  }
}
