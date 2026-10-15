import type { ProductCategory } from './ProductCategory'

export type ShoppingItem = {
  id: string
  listId: string
  name: string
  quantity: number
  unit: string
  checked: boolean
  category: ProductCategory
}
