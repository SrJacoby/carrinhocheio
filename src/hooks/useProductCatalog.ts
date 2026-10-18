import { useEffect, useState } from 'react'
import type { CatalogProduct } from '../types/CatalogProduct'
import { CATALOG_STORAGE_KEY, loadCatalog, saveToStorage } from '../utils/storage'

export type CatalogSaveResult = 'success' | 'duplicate' | 'invalid'

function normalizeProductName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

export function useProductCatalog() {
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>(loadCatalog)

  useEffect(() => {
    saveToStorage(CATALOG_STORAGE_KEY, catalogProducts)
  }, [catalogProducts])

  function addCatalogProduct(
    name: string,
    category: CatalogProduct['category'],
    defaultUnit: string,
    unitPrice: number | null = null
  ): CatalogSaveResult {
    const cleanName = name.trim().replace(/\s+/g, ' ')
    const cleanUnit = defaultUnit.trim()
    if (cleanName.length < 2 || !cleanUnit ||
        (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0))) return 'invalid'

    if (catalogProducts.some((product) =>
      normalizeProductName(product.name) === normalizeProductName(cleanName)
    )) return 'duplicate'

    setCatalogProducts((previous) => [
      ...previous,
      { id: crypto.randomUUID(), name: cleanName, category, defaultUnit: cleanUnit, unitPrice }
    ])
    return 'success'
  }

  function editCatalogProduct(
    productId: string,
    name: string,
    category: CatalogProduct['category'],
    defaultUnit: string,
    unitPrice: number | null = null
  ): CatalogSaveResult {
    const cleanName = name.trim().replace(/\s+/g, ' ')
    const cleanUnit = defaultUnit.trim()
    if (cleanName.length < 2 || !cleanUnit ||
        (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0))) return 'invalid'
    if (!catalogProducts.some((product) => product.id === productId)) return 'invalid'

    if (catalogProducts.some((product) =>
      product.id !== productId &&
      normalizeProductName(product.name) === normalizeProductName(cleanName)
    )) return 'duplicate'

    setCatalogProducts((previous) => previous.map((product) =>
      product.id === productId
        ? { ...product, name: cleanName, category, defaultUnit: cleanUnit, unitPrice }
        : product
    ))
    return 'success'
  }

  function deleteCatalogProduct(productId: string) {
    setCatalogProducts((previous) => previous.filter((product) => product.id !== productId))
  }

  return { catalogProducts, addCatalogProduct, editCatalogProduct, deleteCatalogProduct }
}
