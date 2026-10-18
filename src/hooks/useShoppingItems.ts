import { useEffect, useState } from 'react'
import type { ShoppingItem } from '../types/ShoppingItem'
import type { ProductCategory } from '../types/ProductCategory'
import { ITEMS_STORAGE_KEY, loadItems, saveToStorage } from '../utils/storage'

export function useShoppingItems() {
  const [items, setItems] = useState<ShoppingItem[]>(loadItems)

  useEffect(() => {
    saveToStorage(ITEMS_STORAGE_KEY, items)
  }, [items])

  function addItem(
    listId: string,
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory,
    unitPrice: number | null
  ) {
    const cleanName = name.trim()
    if (
      !cleanName || !Number.isFinite(quantity) || quantity <= 0 ||
      (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0))
    ) return

    setItems((previous) => {
      const existingIndex = previous.findIndex((item) =>
        item.listId === listId &&
        item.name.trim().toLocaleLowerCase('pt-BR') === cleanName.toLocaleLowerCase('pt-BR') &&
        item.unit === unit
      )

      if (existingIndex !== -1) {
        return previous.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [...previous, {
        id: crypto.randomUUID(),
        listId,
        name: cleanName,
        quantity,
        unit,
        checked: false,
        category,
        unitPrice
      }]
    })
  }

  function editItem(
    id: string,
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory,
    unitPrice: number | null
  ) {
    const cleanName = name.trim()
    if (
      !cleanName || !Number.isFinite(quantity) || quantity <= 0 ||
      (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0))
    ) return

    setItems((previous) => previous.map((item) =>
      item.id === id
        ? { ...item, name: cleanName, quantity, unit, category, unitPrice }
        : item
    ))
  }

  function toggleItem(id: string) {
    setItems((previous) => previous.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  function deleteItem(id: string) {
    setItems((previous) => previous.filter((item) => item.id !== id))
  }

  function deleteItemsFromList(listId: string) {
    setItems((previous) => previous.filter((item) => item.listId !== listId))
  }

  function duplicateItems(originalListId: string, newListId: string) {
    setItems((previous) => [
      ...previous,
      ...previous.filter((item) => item.listId === originalListId).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        listId: newListId,
        checked: false
      }))
    ])
  }

  function clearCompletedItems(listId: string) {
    setItems((previous) => previous.filter((item) =>
      item.listId !== listId || !item.checked
    ))
  }

  function resetList(listId: string) {
    setItems((previous) => previous.map((item) =>
      item.listId === listId ? { ...item, checked: false } : item
    ))
  }

  return {
    items, addItem, editItem, toggleItem, deleteItem,
    deleteItemsFromList, duplicateItems, clearCompletedItems, resetList
  }
}
