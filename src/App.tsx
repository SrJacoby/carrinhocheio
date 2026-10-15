import type { ShoppingList } from './types/ShoppingList'
import type { ShoppingItem } from './types/ShoppingItem'
import { useEffect, useState } from 'react'
import ShoppingListCard from './components/ShoppingListCard/ShoppingListCard'
import ShoppingListDetails from './components/ShoppingListDetails/ShoppingListDetails'
import type { ProductCategory } from './types/ProductCategory'
import './App.css'

const LISTS_STORAGE_KEY = 'carrinhocheio_lists'
const ITEMS_STORAGE_KEY = 'carrinhocheio_items'


function loadLists(): ShoppingList[] {
  try {
    const savedLists = localStorage.getItem(LISTS_STORAGE_KEY)

    if (!savedLists) return []

    const parsed: unknown = JSON.parse(savedLists)
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (list) =>
          typeof list === 'object' &&
          list !== null &&
          typeof list.id === 'string' &&
          typeof list.name === 'string'
      )
    ) {
      return []
    }
    return (parsed as ShoppingList[]).map((list) => ({
      ...list,
      budget: typeof list.budget === 'number' && Number.isFinite(list.budget) && list.budget >= 0
        ? list.budget
        : null
    }))
  } catch {
    return []
  }
}

function loadItems(): ShoppingItem[] {
  try {
    const savedItems = localStorage.getItem(
      ITEMS_STORAGE_KEY
    )

    if (!savedItems) return []

    const parsed: unknown = JSON.parse(savedItems)
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
    ) {
      return []
    }
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
      unitPrice: (
        typeof item.unitPrice === 'number' &&
        Number.isFinite(item.unitPrice) &&
        item.unitPrice >= 0
      ) ? item.unitPrice : null
    }))
  } catch {
    return []
  }
}

function App() {
  const [lists, setLists] = useState<ShoppingList[]>(loadLists)
  const [showForm, setShowForm] = useState(false)
  const [listName, setListName] = useState('')
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [items, setItems] = useState<ShoppingItem[]>(loadItems)
  const selectedList = lists.find(
    (list) => list.id === selectedListId
    
  )
  const selectedListItems = items.filter(
    (item) => item.listId === selectedListId
  )

useEffect(() => {
    try {
      localStorage.setItem(
        LISTS_STORAGE_KEY,
        JSON.stringify(lists)
      )
    } catch (error) {
      console.error(
        'Não foi possível salvar as listas:',
        error
      )
    }
  }, [lists])

useEffect(() => {
    try {
      localStorage.setItem(
        ITEMS_STORAGE_KEY,
        JSON.stringify(items)
      )
    } catch (error) {
      console.error(
        'Não foi possível salvar os produtos:',
        error
      )
    }
  }, [items])

  function handleCreateList() {
    const name = listName.trim()
    if (!name) return
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name: name,
      budget: null
    }
    setLists((previousLists) => [
      ...previousLists,
      newList
    ])
    setListName('')
    setShowForm(false)
  }

  
  function handleDeleteList(id: string) {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta lista e todos os seus produtos?'
    )

    if (!confirmed) return
    setLists((previousLists) =>
      previousLists.filter(
        (list) => list.id !== id
      )
    )
    setItems((previousItems) =>
      previousItems.filter(
        (item) => item.listId !== id
      )
    )
  }

function handleDuplicateList(listId: string) {
    const originalList = lists.find(
      (list) => list.id === listId
    )

    if (!originalList) return
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name: `${originalList.name} (cópia)`,
      budget: originalList.budget ?? null
    }
    const originalItems = items.filter(
      (item) => item.listId === listId
    )
    const duplicatedItems: ShoppingItem[] =
      originalItems.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        listId: newList.id,
        checked: false
      }))
    setLists((previousLists) => [
      ...previousLists,
      newList
    ])

    setItems((previousItems) => [
      ...previousItems,
      ...duplicatedItems
    ])
  }

function handleAddItem(
    listId: string,
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory,
    unitPrice: number | null
  ) {
    const itemName = name.trim()

    if (
      !itemName ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0))
    ) {
      return
    }

    setItems((previousItems) => {
      const existingIndex = previousItems.findIndex(
        (item) =>
          item.listId === listId &&
          item.name.trim().toLocaleLowerCase('pt-BR') ===
            itemName.toLocaleLowerCase('pt-BR') &&
          item.unit === unit
      )
      if (existingIndex !== -1) {
        return previousItems.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + quantity
              }
            : item
        )
      }
      const newItem: ShoppingItem = {
        id: crypto.randomUUID(),
        listId,
        name: itemName,
        quantity,
        unit,
        checked: false,
        category,
        unitPrice
      }

      return [...previousItems, newItem]
    })
  }

function handleToggleItem(id: string) {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked }
          : item
      )
    )
  }

function handleClearCompletedItems(listId: string) {
    setItems((previousItems) =>
      previousItems.filter(
        (item) =>
          item.listId !== listId || !item.checked
      )
    )
  }

function handleResetList(listId: string) {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.listId === listId
          ? { ...item, checked: false }
          : item
      )
    )
  }

function handleDeleteItem(id: string) {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este produto?'
    )

    if (!confirmed) return
    setItems((previousItems) =>
      previousItems.filter(
        (item) => item.id !== id
      )
    )
  }

function handleEditItem(
    id: string,
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory,
    unitPrice: number | null
  ) {
    const itemName = name.trim()

    if (
      !itemName ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      (unitPrice !== null && (!Number.isFinite(unitPrice) || unitPrice < 0))
    ) {
      return
    }

    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? {
              ...item,
              name: itemName,
              quantity,
              unit,
              category,
              unitPrice
            }
          : item
      )
    )
  }

function handleEditList(id: string, newName: string) {
    const name = newName.trim()
    if (!name) return
    setLists((previousLists) =>
      previousLists.map((list) =>
        list.id === id
          ? { ...list, name }
          : list
      )
    )
  }
  function handleUpdateBudget(
    listId: string,
    budget: number | null
  ) {
    if (
      budget !== null &&
      (!Number.isFinite(budget) || budget < 0)
    ) {
      return
    }

    setLists((previousLists) =>
      previousLists.map((list) =>
        list.id === listId
          ? { ...list, budget }
          : list
      )
    )
  }
  if (selectedList) {
    return (
      <main className="app">
        <header className="app-header">
          <h1>🛒 CarrinhoCheio</h1>
          <p>Suas compras, organizadas.</p>
        </header>

      <ShoppingListDetails
        title={selectedList.name}
        items={selectedListItems}
        onBack={() => setSelectedListId(null)} 
        onAddItem={(name, quantity, unit, category, unitPrice) =>
          handleAddItem(
            selectedList.id,
            name,
            quantity,
            unit,
            category,
            unitPrice
          )
        }
        onToggleItem={handleToggleItem}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
        onClearCompleted={() =>
          handleClearCompletedItems(selectedList.id)
        }
        onResetList={() =>
          handleResetList(selectedList.id)
        }
        budget={selectedList.budget ?? null}
        onUpdateBudget={(budget) =>
          handleUpdateBudget(selectedList.id, budget)
        }
      />
      </main>
    )
  }

  return (
    <main className="app">
      
      <header className="app-header">
        <h1>🛒 CarrinhoCheio</h1>
        <p>Suas compras, organizadas.</p>
      </header>

      <section className="lists-section">
        <div className="lists-header">
          <h2>Minhas listas</h2>

          <button
            type="button"
            className="new-list-button"
            onClick={() => setShowForm(!showForm)}
          >
            + Nova lista
          </button>
        </div>

        {showForm && (
          <form
            className="new-list-form"
            onSubmit={(event) => {
              event.preventDefault()
              handleCreateList()
            }}
          >
            <input
              type="text"
              placeholder="Nome da lista"
              aria-label="Nome da lista"
              maxLength={60}
              value={listName}
              onChange={(event) =>
                setListName(event.target.value)
              }
            />

            <button type="submit">
              Criar lista
            </button>
          </form>
        )}

        <div className="lists-container">
          {lists.map((list) => (
            <ShoppingListCard
              key={list.id}
              title={list.name}
              itemCount={
                items.filter(
                  (item) => item.listId === list.id
                ).length
              }
              onDelete={() => handleDeleteList(list.id)}
              onEdit={(newName) =>
                handleEditList(list.id, newName)
              }
              onOpen={() => setSelectedListId(list.id)}
              onDuplicate={() => handleDuplicateList(list.id)}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
