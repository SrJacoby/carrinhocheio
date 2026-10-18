
import { useState } from 'react'
import type { FormEvent } from 'react'

import ShoppingListCard from '../ShoppingListCard/ShoppingListCard'
import { ProductCatalog } from '../ProductCatalog/ProductCatalog'

import type { ShoppingList } from '../../types/ShoppingList'
import type { ShoppingItem } from '../../types/ShoppingItem'
import type { CatalogProduct } from '../../types/CatalogProduct'
import type { CatalogSaveResult } from '../../hooks/useProductCatalog'

import { ListPlus, Package, ShoppingCart, Plus } from 'lucide-react'
import FormField from '../ui/FormField/FormField'
import EmptyState from '../ui/EmptyState/EmptyState'
import Button from '../ui/Button/Button'


import './ShoppingListsHome.css'

type ShoppingListsHomeProps = {
  lists: ShoppingList[]
  items: ShoppingItem[]
  catalogProducts: CatalogProduct[]
  onCreateList: (name: string) => void
  onDeleteList: (id: string) => void
  onDuplicateList: (id: string) => void
  onEditList: (id: string, name: string) => void
  onOpenList: (id: string) => void

  onAddCatalogProduct: (
    name: string,
    category: CatalogProduct['category'],
    defaultUnit: string,
    unitPrice?: number | null
  ) => CatalogSaveResult

  onEditCatalogProduct: (
    id: string,
    name: string,
    category: CatalogProduct['category'],
    defaultUnit: string,
    unitPrice?: number | null
  ) => CatalogSaveResult

  onDeleteCatalogProduct: (id: string) => void
  onNotify?: (type: 'success' | 'error' | 'info', title: string) => void
}

export default function ShoppingListsHome({
  lists,
  items,
  catalogProducts,
  onCreateList,
  onDeleteList,
  onDuplicateList,
  onEditList,
  onOpenList,
  onAddCatalogProduct,
  onEditCatalogProduct,
  onDeleteCatalogProduct,
  onNotify
}: ShoppingListsHomeProps) {
  const [showForm, setShowForm] = useState(false)
  const [listName, setListName] = useState('')
  const [showCatalog, setShowCatalog] = useState(false)

  function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = listName.trim()

    if (!name) return

    onCreateList(name)

    setListName('')
    setShowForm(false)
  }

  const itemCounts = items.reduce<Record<string, number>>((counts, item) => {
    counts[item.listId] = (counts[item.listId] ?? 0) + 1
    return counts
  }, {})

  return (
    <>
      <div className="catalog-preview">
        <Package size={25} aria-hidden="true" />

        <div>
          <strong>Catálogo de produtos</strong>

          <p>
            {catalogProducts.length}{' '}
            {catalogProducts.length === 1
              ? 'produto disponível'
              : 'produtos disponíveis'}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCatalog((previous) => !previous)
          }
        >
          {showCatalog
            ? 'Fechar catálogo'
            : 'Abrir catálogo'}
        </button>
      </div>

      {showCatalog && (
        <ProductCatalog
          products={catalogProducts}
          shoppingItems={items}
          onAddProduct={onAddCatalogProduct}
          onEditProduct={onEditCatalogProduct}
          onDeleteProduct={onDeleteCatalogProduct}
          onNotify={onNotify}
        />
      )}

      <section className="lists-section">
        <div className="lists-header">
          <h2>Minhas Listas</h2>

          <button
            type="button"
            className="new-list-button"
            onClick={() =>
              setShowForm((previous) => !previous)
            }
          >
            <Plus size={17} aria-hidden="true" /> Nova lista
          </button>
        </div>

        {showForm && (
          <form
            className="new-list-form"
            onSubmit={handleCreateList}
          >
            
            <FormField
              label="Nome da nova lista"
              type="text"
              placeholder="Ex.: Compras da semana"
              maxLength={60}
              value={listName}
              onChange={(event) =>
                setListName(event.target.value)
              }
              icon={<ListPlus />}
              required
            />


            <button type="submit">
              Criar lista
            </button>
          </form>
        )}

        {lists.length === 0 ? (
          <EmptyState
            icon={<ShoppingCart />}
            title="Nenhuma lista criada"
            description="Crie sua primeira lista para começar a organizar suas compras."
            action={<Button icon={<Plus />} onClick={() => setShowForm(true)}>Criar primeira lista</Button>}
          />
        ) : (
          <div className="lists-container">
            {lists.map((list) => (
              <ShoppingListCard
                key={list.id}
                title={list.name}
                itemCount={itemCounts[list.id] ?? 0}
                onDelete={() =>
                  onDeleteList(list.id)
                }
                onEdit={(newName) =>
                  onEditList(list.id, newName)
                }
                onOpen={() =>
                  onOpenList(list.id)
                }
                onDuplicate={() =>
                  onDuplicateList(list.id)
                }
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
