import type { ShoppingList } from './types/ShoppingList'
import type { ShoppingItem } from './types/ShoppingItem'
import { useEffect, useState } from 'react'
import ShoppingListCard from './components/ShoppingListCard/ShoppingListCard'
import ShoppingListDetails from './components/ShoppingListDetails/ShoppingListDetails'
import type { ProductCategory } from './types/ProductCategory'
import './App.css'

/* ========================================
   CHAVES DO ARMAZENAMENTO LOCAL
======================================== */

const LISTS_STORAGE_KEY = 'carrinhocheio_lists'
const ITEMS_STORAGE_KEY = 'carrinhocheio_items'


function loadLists(): ShoppingList[] {
  try {
    const savedLists = localStorage.getItem(LISTS_STORAGE_KEY)

    if (!savedLists) return []

    const parsed: unknown = JSON.parse(savedLists)

    // Confere se os dados têm o formato esperado
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

    
  return (parsed as ShoppingItem[]).map((item) => ({
    ...item,
    category:
      item.category === 'hortifruti' ||
      item.category === 'laticinios' ||
      item.category === 'carnes' ||
      item.category === 'padaria' ||
      item.category === 'limpeza' ||
      item.category === 'outros'
        ? item.category
        : 'outros'
  }))
  } catch {
    // Evita que dados inválidos impeçam a aplicação de abrir
    return []
  }
}

/* ========================================
   RECUPERAÇÃO DOS PRODUTOS
======================================== */

function loadItems(): ShoppingItem[] {
  try {
    const savedItems = localStorage.getItem(
      ITEMS_STORAGE_KEY
    )

    if (!savedItems) return []

    const parsed: unknown = JSON.parse(savedItems)

    // Verifica se os dados possuem o formato esperado
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

    return parsed as ShoppingItem[]
  } catch {
    // Dados inválidos não devem impedir a abertura do app
    return []
  }
}

function App() {
  // Listas de compras criadas pelo usuário
  const [lists, setLists] = useState<ShoppingList[]>(loadLists)

  // Controla a exibição do formulário
  const [showForm, setShowForm] = useState(false)

  // Armazena o nome digitado
  const [listName, setListName] = useState('')
  // Identifica qual lista está aberta
  const [selectedListId, setSelectedListId] = useState<string | null>(null)

  // Armazena os produtos cadastrados nas listas
  const [items, setItems] = useState<ShoppingItem[]>(loadItems)

  // Procura a lista selecionada pelo seu ID
  const selectedList = lists.find(
    (list) => list.id === selectedListId
    
  )

  // Recupera somente os produtos da lista selecionada
  const selectedListItems = items.filter(
    (item) => item.listId === selectedListId
  )
  
  /* ========================================
    PERSISTÊNCIA DAS LISTAS
  ======================================== */

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

  
  /* ========================================
    PERSISTÊNCIA DOS PRODUTOS
  ======================================== */

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

    // Impede a criação de listas sem nome
    if (!name) return

    // Cria um objeto para a nova lista
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name: name
    }

    // Adiciona a nova lista ao estado
    setLists((previousLists) => [
      ...previousLists,
      newList
    ])

    // Limpa e fecha o formulário
    setListName('')
    setShowForm(false)
  }

  
  function handleDeleteList(id: string) {
    // Solicita confirmação antes da exclusão
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta lista e todos os seus produtos?'
    )

    if (!confirmed) return

    // Remove a lista selecionada
    setLists((previousLists) =>
      previousLists.filter(
        (list) => list.id !== id
      )
    )

    // Remove os produtos associados à lista
    setItems((previousItems) =>
      previousItems.filter(
        (item) => item.listId !== id
      )
    )
  }

  
  /* ========================================
    DUPLICAR LISTA E SEUS PRODUTOS
  ======================================== */

  function handleDuplicateList(listId: string) {
    // 1. Encontra a lista original
    const originalList = lists.find(
      (list) => list.id === listId
    )

    if (!originalList) return

    // 2. Cria uma nova lista com outro ID
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name: `${originalList.name} (cópia)`
    }

    // 3. Encontra os produtos da lista original
    const originalItems = items.filter(
      (item) => item.listId === listId
    )

    // 4. Cria cópias independentes dos produtos
    const duplicatedItems: ShoppingItem[] =
      originalItems.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        listId: newList.id,
        checked: false
      }))

    // 5. Adiciona a lista e seus produtos
    setLists((previousLists) => [
      ...previousLists,
      newList
    ])

    setItems((previousItems) => [
      ...previousItems,
      ...duplicatedItems
    ])
  }
  
  /* ========================================
    CADASTRO E SOMA AUTOMÁTICA DE PRODUTOS
  ======================================== */

  function handleAddItem(
    listId: string,
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory
  ) {
    const itemName = name.trim()

    if (
      !itemName ||
      !Number.isFinite(quantity) ||
      quantity <= 0
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

      // Produto existente: soma as quantidades
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

      // Produto novo: registra a categoria
      const newItem: ShoppingItem = {
        id: crypto.randomUUID(),
        listId,
        name: itemName,
        quantity,
        unit,
        checked: false,
        category
      }

      return [...previousItems, newItem]
    })
  }

  
  /* ========================================
    CONTROLE DE PRODUTOS COMPRADOS
  ======================================== */

  function handleToggleItem(id: string) {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked }
          : item
      )
    )
  }

  
  /* ========================================
    AULA 22 — LIMPAR PRODUTOS COMPRADOS
  ======================================== */

  function handleClearCompletedItems(listId: string) {
    setItems((previousItems) =>
      previousItems.filter(
        (item) =>
          item.listId !== listId || !item.checked
      )
    )
  }

  /* ========================================
    AULA 22 — REINICIAR LISTA DE COMPRAS
  ======================================== */

  function handleResetList(listId: string) {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.listId === listId
          ? { ...item, checked: false }
          : item
      )
    )
  }

  /* ========================================
    EXCLUSÃO INDIVIDUAL DE PRODUTOS
  ======================================== */

  function handleDeleteItem(id: string) {
    // Solicita confirmação antes da exclusão
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este produto?'
    )

    if (!confirmed) return

    // Remove somente o produto selecionado
    setItems((previousItems) =>
      previousItems.filter(
        (item) => item.id !== id
      )
    )
  }

  
  /* ========================================
    EDIÇÃO DE PRODUTOS
  ======================================== */

  function handleEditItem(
    id: string,
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory
  ) {
    const itemName = name.trim()

    if (
      !itemName ||
      !Number.isFinite(quantity) ||
      quantity <= 0
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
              category
            }
          : item
      )
    )
  }

  /* ========================================
    EDIÇÃO DE LISTAS
  ======================================== */

  function handleEditList(id: string, newName: string) {
    const name = newName.trim()

    // Impede nomes vazios
    if (!name) return

    // Atualiza somente a lista selecionada
    setLists((previousLists) =>
      previousLists.map((list) =>
        list.id === id
          ? { ...list, name }
          : list
      )
    )
  }
  
  // Exibe os detalhes quando uma lista está selecionada
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
        onAddItem={(name, quantity, unit, category) =>
          handleAddItem(
            selectedList.id,
            name,
            quantity,
            unit,
            category
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
