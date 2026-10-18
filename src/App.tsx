import { useState } from 'react'
import { useToast } from './hooks/useToast'
import ToastContainer from './components/ui/Toast/ToastContainer'
import ConfirmDialog from './components/ui/ConfirmDialog/ConfirmDialog'
import AppHeader from './components/AppHeader/AppHeader'
import ShoppingListsHome from './components/ShoppingListsHome/ShoppingListsHome'
import ShoppingListDetails from './components/ShoppingListDetails/ShoppingListDetails'
import { useShoppingLists } from './hooks/useShoppingLists'
import { useShoppingItems } from './hooks/useShoppingItems'
import { useProductCatalog } from './hooks/useProductCatalog'
import type { CatalogProduct } from './types/CatalogProduct'
import './App.css'

function App() {
  const { toasts, showToast, removeToast } = useToast()
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [listToDeleteId, setListToDeleteId] = useState<string | null>(null)

  const {
    lists, createList, deleteList, duplicateList, editList, updateBudget
  } = useShoppingLists()

  const {
    items, addItem, editItem, toggleItem, deleteItem,
    deleteItemsFromList, duplicateItems, clearCompletedItems, resetList
  } = useShoppingItems()

  const {
    catalogProducts, addCatalogProduct, editCatalogProduct, deleteCatalogProduct
  } = useProductCatalog()

  const listToDelete = lists.find((list) => list.id === listToDeleteId)
  const selectedList = lists.find((list) => list.id === selectedListId)
  const selectedListItems = items.filter((item) => item.listId === selectedListId)

  function handleDeleteList(id: string) {
    setListToDeleteId(id)
  }

  function confirmDeleteList() {
    if (!listToDeleteId) return
    const id = listToDeleteId
    deleteList(id)
    deleteItemsFromList(id)
    if (selectedListId === id) setSelectedListId(null)
    setListToDeleteId(null)
    showToast('success', 'Lista excluída', 'A lista e seus produtos foram removidos.')
  }

  function handleDuplicateList(id: string) {
    const newId = duplicateList(id)
    if (newId) {
      duplicateItems(id, newId)
      showToast('success', 'Lista duplicada')
    }
  }

  function handleCreateList(name: string) {
    createList(name)
    showToast('success', 'Lista criada com sucesso')
  }

  function handleEditList(id: string, name: string) {
    editList(id, name)
    showToast('success', 'Nome da lista atualizado')
  }

  function handleAddItem(listId: string, name: string, quantity: number, unit: string, category: Parameters<typeof addItem>[4], unitPrice: number | null) {
    addItem(listId, name, quantity, unit, category, unitPrice)
    showToast('success', 'Produto adicionado à lista')
  }

  function handleEditItem(...args: Parameters<typeof editItem>) {
    editItem(...args)
    showToast('success', 'Produto atualizado')
  }

  function handleDeleteItem(id: string) {
    deleteItem(id)
    showToast('success', 'Produto removido da lista')
  }

  function handleClearCompleted(listId: string) {
    clearCompletedItems(listId)
    showToast('success', 'Produtos comprados removidos')
  }

  function handleResetList(listId: string) {
    resetList(listId)
    showToast('info', 'Lista reiniciada')
  }

  // Reaproveita as regras de cadastro e soma de quantidades.
  function handleAddCatalogItem(
    listId: string,
    product: CatalogProduct,
    quantity: number
  ) {
    handleAddItem(
      listId,
      product.name,
      quantity,
      product.defaultUnit,
      product.category,
      product.unitPrice ?? null
    )
  }

  return (
    <main className="app">
      <AppHeader
        currentList={selectedList?.name ?? null}
        onGoHome={() => setSelectedListId(null)}
      />

      {selectedList ? (
        <ShoppingListDetails
          title={selectedList.name}
          items={selectedListItems}
          historicalItems={items}
          onBack={() => setSelectedListId(null)}
          onAddItem={(name, quantity, unit, category, unitPrice) =>
            handleAddItem(selectedList.id, name, quantity, unit, category, unitPrice)
          }
          catalogProducts={catalogProducts}
          onAddCatalogItem={(product, quantity) =>
            handleAddCatalogItem(selectedList.id, product, quantity)
          }
          onToggleItem={toggleItem}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
          onClearCompleted={() => handleClearCompleted(selectedList.id)}
          onResetList={() => handleResetList(selectedList.id)}
          budget={selectedList.budget ?? null}
          onUpdateBudget={(budget) => updateBudget(selectedList.id, budget)}
        />
      ) : (
        <ShoppingListsHome
          lists={lists}
          items={items}
          catalogProducts={catalogProducts}
          onCreateList={handleCreateList}
          onDeleteList={handleDeleteList}
          onDuplicateList={handleDuplicateList}
          onEditList={handleEditList}
          onOpenList={setSelectedListId}
          onAddCatalogProduct={addCatalogProduct}
          onEditCatalogProduct={editCatalogProduct}
          onDeleteCatalogProduct={deleteCatalogProduct}
          onNotify={showToast}
        />
      )}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmDialog
        open={listToDelete !== undefined}
        title="Excluir lista?"
        description={`A lista "${listToDelete?.name ?? ''}" e todos os seus produtos serão excluídos permanentemente.`}
        confirmLabel="Excluir lista"
        onConfirm={confirmDeleteList}
        onCancel={() => setListToDeleteId(null)}
      />
    </main>
  )
}

export default App
