import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowLeft, Wallet, ChevronDown, ChevronUp,
  Package, Search
} from 'lucide-react'
import type { ShoppingItem } from '../../types/ShoppingItem'
import type { ProductCategory } from '../../types/ProductCategory'
import type { CatalogProduct } from '../../types/CatalogProduct'
import CatalogProductPicker from '../CatalogProductPicker/CatalogProductPicker'
import ProductSuggestions from '../ProductSuggestions/ProductSuggestions'
import './ShoppingListDetails.css'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../../data/productCategories'
import { calculateSubtotal, currencyFormatter } from '../../utils/shoppingCalculations'
import ShoppingItemCard from '../ShoppingItemCard/ShoppingItemCard'
import ConfirmDialog from '../ui/ConfirmDialog/ConfirmDialog'
import EmptyState from '../ui/EmptyState/EmptyState'
import ShoppingReceipt from './ShoppingReceipt'

type ShoppingListDetailsProps = {
  catalogProducts: CatalogProduct[]
  historicalItems?: ShoppingItem[]
  onAddCatalogItem: (product: CatalogProduct, quantity: number) => void
  title: string
  budget: number | null
  onUpdateBudget: (budget: number | null) => void
  items: ShoppingItem[]
  onBack: () => void
  onAddItem: (
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory,
    unitPrice: number | null
  ) => void
  onClearCompleted: () => void
  onResetList: () => void
  onToggleItem: (id: string) => void
  onDeleteItem: (id: string) => void
  onEditItem: (
    id: string,
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory,
    unitPrice: number | null
  ) => void
}

type ProductFilter = 'all' | 'pending' | 'completed'

type ProductSort =
  | 'pending'
  | 'name-asc'
  | 'name-desc'
  | 'quantity-asc'
  | 'quantity-desc'

function ShoppingListDetails({
  title,
  budget,
  onUpdateBudget,
  items,
  onBack,
  onAddItem,
  onClearCompleted,
  onResetList,
  onToggleItem,
  onDeleteItem,
  onEditItem,
  catalogProducts,
  historicalItems = [],
  onAddCatalogItem,
}: ShoppingListDetailsProps) {
  const [itemName, setItemName] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('un')
  const [category, setCategory] = useState<ProductCategory>('outros')
  const [unitPrice, setUnitPrice] = useState('')
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const showAddForm = items.length === 0 || isAddFormOpen
  const [searchTerm, setSearchTerm] = useState('')
  const [productFilter, setProductFilter] = useState<ProductFilter>('all')
  const [productSort, setProductSort] = useState<ProductSort>('pending')
  const [groupByCategory, setGroupByCategory] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'clear' | 'reset' | null>(null)
  const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null)

  const [isBudgetEditing, setIsBudgetEditing] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = itemName.trim()
    const quantityNumber = Number(quantity)
    const priceNumber =
      unitPrice.trim() === ''
        ? null
        : Number(unitPrice)
    if (
      priceNumber !== null &&
      (!Number.isFinite(priceNumber) || priceNumber < 0)
    ) {
      return
    }

    if (!name || !quantity.trim() || !Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      return
    }

    onAddItem(name, quantityNumber, unit, category, priceNumber)

    setItemName('')
    setShowSuggestions(false)
    setQuantity('1')
    setUnit('un')
    setCategory('outros')
    setIsAddFormOpen(true)
    setUnitPrice('')
  }

  // Preenche os dados reutilizáveis do catálogo.
  function handleSelectSuggestion(product: CatalogProduct) {
    setItemName(product.name)
    setCategory(product.category)
    setUnit(product.defaultUnit)
    setShowSuggestions(false)
  }

  // Edita o limite de gastos da lista.
  function handleStartBudgetEdit() {
    setBudgetInput(budget === null ? '' : String(budget))
    setIsBudgetEditing(true)
  }

  function handleSaveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = budgetInput.trim()

    if (value === '') {
      onUpdateBudget(null)
      setIsBudgetEditing(false)
      return
    }

    const parsedBudget = Number(value)
    if (!Number.isFinite(parsedBudget) || parsedBudget < 0) return

    onUpdateBudget(parsedBudget)
    setIsBudgetEditing(false)
  }

  const totalItems = items.length
  const completedItems = items.filter((item) => item.checked).length
  const hasCompletedItems = completedItems > 0
  const progress = totalItems === 0
    ? 0
    : Math.round((completedItems / totalItems) * 100)
  const estimatedTotal = items.reduce(
    (total, item) => {
      const subtotal = calculateSubtotal(
        item.quantity,
        item.unitPrice
      )

      return total + (subtotal ?? 0)
    },
    0
  )
  const itemsWithoutPrice = items.filter(
    (item) =>
      calculateSubtotal(
        item.quantity,
        item.unitPrice
      ) === null
  ).length
  const hasCompleteEstimate =
    items.length > 0 && itemsWithoutPrice === 0
  // Totais derivados dos preços e das marcações.
  const purchasedTotal = items.reduce((total, item) => {
    if (!item.checked) return total
    return total + (calculateSubtotal(item.quantity, item.unitPrice) ?? 0)
  }, 0)

  const pendingTotal = items.reduce((total, item) => {
    if (item.checked) return total
    return total + (calculateSubtotal(item.quantity, item.unitPrice) ?? 0)
  }, 0)

  const budgetBalance = budget === null ? null : budget - estimatedTotal

  // Define a mensagem de fechamento do orçamento.
    const budgetSummary =
      budget === null
        ? null
        : budgetBalance === null
          ? null
          : budgetBalance < 0
            ? {
                type: 'exceeded',
                title: 'Acima do orçamento',
                message: `O total conhecido ultrapassou o limite em ${currencyFormatter.format(Math.abs(budgetBalance))}.`
              }
            : budgetBalance === 0
              ? {
                  type: 'balanced',
                  title: 'No limite do orçamento',
                  message: 'O total conhecido atingiu exatamente o valor planejado.'
                }
              : {
                  type: 'available',
                  title: 'Abaixo do orçamento',
                  message: `Ainda restam ${currencyFormatter.format(budgetBalance)} do limite planejado.`
                }

  const sortedItems = [...items].sort((a, b) => {
    switch (productSort) {
      case 'name-asc':
        return a.name.localeCompare(b.name, 'pt-BR')
      case 'name-desc':
        return b.name.localeCompare(a.name, 'pt-BR')
      case 'quantity-asc':
        return a.quantity - b.quantity
      case 'quantity-desc':
        return b.quantity - a.quantity
      case 'pending':
      default:
        return Number(a.checked) - Number(b.checked)
    }
  })

  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('pt-BR')

  const visibleItems = sortedItems.filter((item) => {
    const matchesSearch = item.name
      .toLocaleLowerCase('pt-BR')
      .includes(normalizedSearch)

    const matchesFilter =
      productFilter === 'all' ||
      (productFilter === 'pending' && !item.checked) ||
      (productFilter === 'completed' && item.checked)

    return matchesSearch && matchesFilter
  })



  const groupedItems = CATEGORY_ORDER
    .map((groupCategory) => ({
      category: groupCategory,
      label: CATEGORY_LABELS[groupCategory],
      products: visibleItems.filter((item) => item.category === groupCategory)
    }))
    .filter((group) => group.products.length > 0)
    .sort((a, b) => {
      const aCompleted = items.filter((item) => item.category === a.category).every((item) => item.checked)
      const bCompleted = items.filter((item) => item.category === b.category).every((item) => item.checked)
      return Number(aCompleted) - Number(bCompleted)
    })

  const categoryIsComplete = (groupCategory: ProductCategory) => {
    const members = items.filter((item) => item.category === groupCategory)
    return members.length > 0 && members.every((item) => item.checked)
  }

  const visibleItemsWithCompletedCategoriesLast = [...visibleItems].sort((a, b) =>
    Number(categoryIsComplete(a.category)) - Number(categoryIsComplete(b.category))
  )

  function handleConfirmAction() {
    if (confirmAction === 'clear') {
      onClearCompleted()
    } else if (confirmAction === 'reset') {
      onResetList()
    }

    setConfirmAction(null)
  }



  function renderProduct(item: ShoppingItem) {
    return (
      <ShoppingItemCard
        key={item.id}
        item={item}
        catalogProducts={catalogProducts}
        historicalItems={historicalItems}
        onToggleItem={onToggleItem}
        onDeleteItem={setItemToDeleteId}
        onEditItem={onEditItem}
      />
    )
  }


  return (
    <section className="shopping-list-details">
      <button
        type="button"
        className="shopping-list-details__back"
        onClick={onBack}
      >
        <ArrowLeft size={17} aria-hidden="true" />
        <span>Voltar</span>
      </button>

      <header className="shopping-list-details__header">
        <h2>{title}</h2>
        <p>Organize os produtos desta lista.</p>
      </header>

      <div className="shopping-list-details__progress">
        <div className="shopping-list-details__progress-header">
          <span>Progresso das compras</span>
          <strong>{progress}%</strong>
        </div>

        <div
          className="shopping-list-details__progress-bar"
          role="progressbar"
          aria-label="Progresso das compras"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="shopping-list-details__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p>{completedItems} de {totalItems} produtos comprados</p>
      </div>

      <section className="shopping-list-details__financial-summary" aria-label="Definição do orçamento">
        <div className="shopping-list-details__financial-header">
          <Wallet size={20} aria-hidden="true" />
          <h3>Orçamento da lista</h3>
        </div>
        <div className="shopping-list-details__budget">
          <div className="shopping-list-details__budget-header">
            <div>
              <span>Orçamento definido</span>
              <strong>{budget === null ? 'Não definido' : currencyFormatter.format(budget)}</strong>
            </div>
            <button type="button" onClick={handleStartBudgetEdit}>
              {budget === null ? '+ Definir' : 'Editar'}
            </button>
          </div>
          {isBudgetEditing && (
            <form className="shopping-list-details__budget-form" onSubmit={handleSaveBudget}>
              <label htmlFor="list-budget">Limite de gastos (R$)</label>
              <input id="list-budget" type="number" min="0" step="0.01"
                inputMode="decimal" placeholder="Ex.: 200,00"
                value={budgetInput} onChange={(event) => setBudgetInput(event.target.value)} />
              <small>Deixe vazio para remover o orçamento.</small>
              <div className="shopping-list-details__budget-actions">
                <button type="button" onClick={() => setIsBudgetEditing(false)}>Cancelar</button>
                <button type="submit">Salvar orçamento</button>
              </div>
            </form>
          )}
        </div>
      </section>

      <CatalogProductPicker
        products={catalogProducts}
        onAddProduct={onAddCatalogItem}
      />

      <div className="shopping-list-details__add-section">
        <div className="shopping-list-details__add-header">
          <h3>Adicionar produto</h3>
          {items.length > 0 && (
            <button
              type="button"
              className="shopping-list-details__add-toggle"
              aria-expanded={showAddForm}
              aria-controls="add-product-form"
              onClick={() => setIsAddFormOpen((previous) => !previous)}
            >
              {showAddForm ? <><ChevronUp size={16} /> Recolher</> : <><ChevronDown size={16} /> Mostrar</>}
            </button>
          )}
        </div>

        {showAddForm && (
          <form
            id="add-product-form"
            className="shopping-list-details__form"
            onSubmit={handleSubmit}
          >

            <input
              type="text"
              placeholder="Nome do produto"
              aria-label="Nome do produto"
              maxLength={100}
              value={itemName}
              onChange={(event) => {
                setItemName(event.target.value)
                setShowSuggestions(true)
              }}
            />

                          {showSuggestions && (
                <ProductSuggestions
                  search={itemName}
                  products={catalogProducts}
                  onSelect={handleSelectSuggestion}
                />
              )}

<div className="shopping-list-details__form-row">
              <div className="shopping-list-details__field">
                <label htmlFor="item-quantity">Quantidade</label>
                <input
                  id="item-quantity"
                  type="number"
                  min="0.01"
                  step="any"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>

              <div className="shopping-list-details__field">
                <label htmlFor="item-unit">Unidade</label>
                <select
                  id="item-unit"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value)}
                >
                  <option value="un">Unidade</option>
                  <option value="kg">Quilograma (kg)</option>
                  <option value="g">Grama (g)</option>
                  <option value="L">Litro (L)</option>
                  <option value="mL">Mililitro (mL)</option>
                </select>
              </div>
            </div>

            <div className="shopping-list-details__category-field">
              <label htmlFor="item-category">Categoria</label>
              <select
                id="item-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ProductCategory)
                }
              >
                {CATEGORY_ORDER.map((option) => (
                  <option key={option} value={option}>
                    {CATEGORY_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            <div className="shopping-list-details__price-field">
              <label htmlFor="item-price">
                Preço unitário (R$)
              </label>

              <input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Ex.: 6,50"
                value={unitPrice}
                onChange={(event) =>
                  setUnitPrice(event.target.value)
                }
              />

              <small>
                Opcional. Informe o preço de uma unidade
                de medida do produto.
              </small>
            </div>

            <button type="submit">+ Adicionar produto</button>
          </form>
        )}
      </div>

      <div className="shopping-list-details__products">
        <h3>Produtos da lista ({items.length})</h3>

          <div className="shopping-list-details__search">
          <label htmlFor="product-search">Pesquisar produtos</label>
          <div className="shopping-list-details__search-row">
            <input
              id="product-search"
              type="search"
              placeholder="Ex.: arroz, café, leite..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar pesquisa"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

          <div className="shopping-list-details__sort">
          <label htmlFor="product-sort">Ordenar produtos</label>
          <select
            id="product-sort"
            value={productSort}
            onChange={(event) =>
              setProductSort(event.target.value as ProductSort)
            }
          >
            <option value="pending">Pendentes primeiro</option>
            <option value="name-asc">Nome (A–Z)</option>
            <option value="name-desc">Nome (Z–A)</option>
            <option value="quantity-asc">Menor quantidade</option>
            <option value="quantity-desc">Maior quantidade</option>
          </select>
        </div>

          <div className="shopping-list-details__group-control">
          <button
            type="button"
            className={`shopping-list-details__group-button ${
              groupByCategory
                ? 'shopping-list-details__group-button--active'
                : ''
            }`}
            aria-pressed={groupByCategory}
            onClick={() => setGroupByCategory((previous) => !previous)}
          >
            {groupByCategory
              ? 'Agrupamento ativado'
              : 'Agrupar por categoria'}
          </button>
        </div>

          <div
          className="shopping-list-details__filters"
          role="group"
          aria-label="Filtrar produtos"
        >
          <button
            type="button"
            className={
              productFilter === 'all'
                ? 'shopping-list-details__filter--active'
                : ''
            }
            aria-pressed={productFilter === 'all'}
            onClick={() => setProductFilter('all')}
          >
            Todos
          </button>
          <button
            type="button"
            className={
              productFilter === 'pending'
                ? 'shopping-list-details__filter--active'
                : ''
            }
            aria-pressed={productFilter === 'pending'}
            onClick={() => setProductFilter('pending')}
          >
            Pendentes
          </button>
          <button
            type="button"
            className={
              productFilter === 'completed'
                ? 'shopping-list-details__filter--active'
                : ''
            }
            aria-pressed={productFilter === 'completed'}
            onClick={() => setProductFilter('completed')}
          >
            Comprados
          </button>
        </div>

        <p className="shopping-list-details__results" role="status">
          {visibleItems.length}{' '}
          {visibleItems.length === 1
            ? 'produto encontrado'
            : 'produtos encontrados'}
        </p>

          {items.length === 0 ? (
          <EmptyState icon={<Package />} title="Nenhum produto adicionado" description="Os produtos desta lista aparecerão aqui." />
        ) : visibleItems.length === 0 ? (
          <EmptyState icon={<Search />} title="Nenhum produto encontrado" description="Tente pesquisar outro nome ou alterar o filtro." />
        ) : groupByCategory ? (
          <div className="shopping-list-details__groups">
            {groupedItems.map((group) => (
              <section
                key={group.category}
                className="shopping-list-details__group"
              >
                <h4 className="shopping-list-details__group-title">
                  {group.label}
                  <span>{group.products.length}</span>
                </h4>
                <div className="shopping-list-details__items">
                  {group.products.map(renderProduct)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="shopping-list-details__items">
            {visibleItemsWithCompletedCategoriesLast.map(renderProduct)}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="shopping-list-details__manage">
          <h3>Gerenciar lista</h3>

          <div className="shopping-list-details__manage-actions">
            <button
              type="button"
              disabled={!hasCompletedItems}
              onClick={() => setConfirmAction('clear')}
            >
              Limpar comprados
            </button>
            <button
              type="button"
              disabled={!hasCompletedItems}
              onClick={() => setConfirmAction('reset')}
            >
              Reiniciar lista
            </button>
          </div>

          <ConfirmDialog
            open={confirmAction !== null}
            title={confirmAction === 'clear' ? 'Limpar produtos comprados?' : 'Reiniciar lista?'}
            description={confirmAction === 'clear'
              ? 'Todos os produtos marcados como comprados serão excluídos.'
              : 'Todos os produtos voltarão ao estado pendente.'}
            confirmLabel={confirmAction === 'clear' ? 'Limpar comprados' : 'Reiniciar lista'}
            onConfirm={handleConfirmAction}
            onCancel={() => setConfirmAction(null)}
          />
        </div>
      )}

      {items.length > 0 && (
        <ShoppingReceipt
          totalItems={totalItems}
          completedItems={completedItems}
          progress={progress}
          purchasedTotal={purchasedTotal}
          pendingTotal={pendingTotal}
          estimatedTotal={estimatedTotal}
          hasCompleteEstimate={hasCompleteEstimate}
          budget={budget}
          budgetBalance={budgetBalance}
          budgetSummary={budgetSummary}
          itemsWithoutPrice={itemsWithoutPrice}
        />
      )}
      <ConfirmDialog
        open={itemToDeleteId !== null}
        title="Excluir produto?"
        description={`O produto "${items.find((item) => item.id === itemToDeleteId)?.name ?? ''}" será removido desta lista.`}
        confirmLabel="Excluir produto"
        onConfirm={() => {
          if (!itemToDeleteId) return
          onDeleteItem(itemToDeleteId)
          setItemToDeleteId(null)
        }}
        onCancel={() => setItemToDeleteId(null)}
      />
    </section>
  )
}

export default ShoppingListDetails
