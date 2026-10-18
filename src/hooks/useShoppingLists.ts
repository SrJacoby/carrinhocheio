import { useEffect, useState } from 'react'
import type { ShoppingList } from '../types/ShoppingList'
import { LISTS_STORAGE_KEY, loadLists, saveToStorage } from '../utils/storage'

export function useShoppingLists() {
  const [lists, setLists] = useState<ShoppingList[]>(loadLists)

  useEffect(() => {
    saveToStorage(LISTS_STORAGE_KEY, lists)
  }, [lists])

  function createList(name: string) {
    const cleanName = name.trim()
    if (!cleanName) return

    setLists((previous) => [
      { id: crypto.randomUUID(), name: cleanName, budget: null },
      ...previous
    ])
  }

  function deleteList(id: string): boolean {
    setLists((previous) => previous.filter((list) => list.id !== id))
    return true
  }

  function duplicateList(listId: string): string | null {
    const original = lists.find((list) => list.id === listId)
    if (!original) return null

    const newId = crypto.randomUUID()
    setLists((previous) => [
      {
        id: newId,
        name: `${original.name} (cópia)`,
        budget: original.budget ?? null
      },
      ...previous
    ])
    return newId
  }

  function editList(id: string, name: string) {
    const cleanName = name.trim()
    if (!cleanName) return
    setLists((previous) => previous.map((list) =>
      list.id === id ? { ...list, name: cleanName } : list
    ))
  }

  function updateBudget(id: string, budget: number | null) {
    if (budget !== null && (!Number.isFinite(budget) || budget < 0)) return
    setLists((previous) => previous.map((list) =>
      list.id === id ? { ...list, budget } : list
    ))
  }

  return { lists, createList, deleteList, duplicateList, editList, updateBudget }
}
