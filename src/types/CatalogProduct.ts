import type { ProductCategory } from './ProductCategory'

export type CatalogProduct = {
  id: string
  name: string
  category: ProductCategory
  defaultUnit: string
  unitPrice?: number | null
}
