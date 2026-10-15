import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ShoppingItem } from '../../types/ShoppingItem'
import type { ProductCategory } from '../../types/ProductCategory'
import './ShoppingListDetails.css'

type ShoppingListDetailsProps = {
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

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  hortifruti: '🥦 Hortifruti',
  laticinios: '🥛 Laticínios',
  carnes: '🥩 Carnes',
  padaria: '🍞 Padaria',
  limpeza: '🧹 Limpeza',
  outros: '📦 Outros'
}

const CATEGORY_ORDER: ProductCategory[] = [
  'hortifruti',
  'laticinios',
  'carnes',
  'padaria',
  'limpeza',
  'outros'
]

const currencyFormatter = new Intl.NumberFormat(
  'pt-BR',
  {
    style: 'currency',
    currency: 'BRL'
  }
)

function calculateSubtotal(
  quantity: number,
  unitPrice?: number | null
): number | null {
  if (unitPrice == null) {
    return null
  }
  if (
    !Number.isFinite(quantity) ||
    !Number.isFinite(unitPrice) ||
    quantity <= 0 ||
    unitPrice < 0
  ) {
    return null
  }
  return quantity * unitPrice
}

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
  onEditItem
}: ShoppingListDetailsProps) {
  const [itemName, setItemName] = useState('')
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

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  const [editedQuantity, setEditedQuantity] = useState('1')
  const [editedUnit, setEditedUnit] = useState('un')
  const [editedCategory, setEditedCategory] =
    useState<ProductCategory>('outros')
  const [editedUnitPrice, setEditedUnitPrice] = useState('')
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
    setQuantity('1')
    setUnit('un')
    setCategory('outros')
    setIsAddFormOpen(true)
    setUnitPrice('')
  }

  function handleStartEdit(item: ShoppingItem) {
    setEditingItemId(item.id)
    setEditedName(item.name)
    setEditedQuantity(String(item.quantity))
    setEditedUnit(item.unit)
    setEditedCategory(item.category)
    setEditedUnitPrice(
      item.unitPrice == null
        ? ''
        : String(item.unitPrice)
    )
  }

  function handleCancelEdit() {
    setEditingItemId(null)
  }

  function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingItemId === null) return

    const name = editedName.trim()
    const quantityNumber = Number(editedQuantity)

    const editedPriceNumber =
      editedUnitPrice.trim() === ''
        ? null
        : Number(editedUnitPrice)

    if (
      editedPriceNumber !== null &&
      (
        !Number.isFinite(editedPriceNumber) ||
        editedPriceNumber < 0
      )
    ) {
      return
    }

    if (!name || !editedQuantity.trim() || !Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      return
    }

    onEditItem(editingItemId, name, quantityNumber, editedUnit, editedCategory, editedPriceNumber)
    setEditingItemId(null)
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

  const financialProgress = estimatedTotal > 0
    ? Math.min(100, Math.max(0, (purchasedTotal / estimatedTotal) * 100))
    : 0

  // Calcula a situação atual do orçamento.
  const hasBudget = budget !== null

  const budgetBalance = hasBudget
    ? budget - estimatedTotal
    : null

  const budgetPercentage =
    hasBudget && budget > 0
      ? (estimatedTotal / budget) * 100
      : hasBudget && estimatedTotal > 0
        ? 101
        : 0

  const budgetProgress = Math.min(
    100,
    Math.max(0, budgetPercentage)
  )

  const budgetStatus =
    !hasBudget
      ? 'undefined'
      : budgetBalance !== null && budgetBalance < 0
        ? 'exceeded'
        : budgetPercentage >= 80
          ? 'warning'
          : 'safe'
    
  
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

  function handleConfirmAction() {
    if (confirmAction === 'clear') {
      onClearCompleted()
    } else if (confirmAction === 'reset') {
      onResetList()
    }

    setConfirmAction(null)
  }



  function renderProduct(item: ShoppingItem) {
    const subtotal = calculateSubtotal(
      item.quantity,
      item.unitPrice
    )
    return (
      <div
        key={item.id}
        className={`shopping-list-details__item ${
          item.checked ? 'shopping-list-details__item--checked' : ''
        }`}
      >
        {editingItemId === item.id ? (
          <form
            className="shopping-list-details__edit-form"
            onSubmit={handleSaveEdit}
          >
            <div className="shopping-list-details__edit-field">
              <label htmlFor={`edit-name-${item.id}`}>Nome do produto</label>
              <input
                id={`edit-name-${item.id}`}
                type="text"
                maxLength={100}
                value={editedName}
                onChange={(event) => setEditedName(event.target.value)}
              />
            </div>

            <div className="shopping-list-details__edit-row">
              <div className="shopping-list-details__edit-field">
                <label htmlFor={`edit-quantity-${item.id}`}>Quantidade</label>
                <input
                  id={`edit-quantity-${item.id}`}
                  type="number"
                  min="0.01"
                  step="any"
                  value={editedQuantity}
                  onChange={(event) => setEditedQuantity(event.target.value)}
                />
              </div>

              <div className="shopping-list-details__edit-field">
                <label htmlFor={`edit-unit-${item.id}`}>Unidade</label>
                <select
                  id={`edit-unit-${item.id}`}
                  value={editedUnit}
                  onChange={(event) => setEditedUnit(event.target.value)}
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
              <label htmlFor={`edit-category-${item.id}`}>Categoria</label>
              <select
                id={`edit-category-${item.id}`}
                value={editedCategory}
                onChange={(event) =>
                  setEditedCategory(event.target.value as ProductCategory)
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
              <label htmlFor={`edit-price-${item.id}`}>
                Preço unitário (R$)
              </label>

              <input
                id={`edit-price-${item.id}`}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Preço não informado"
                value={editedUnitPrice}
                onChange={(event) =>
                  setEditedUnitPrice(event.target.value)
                }
              />
            </div>

            <div className="shopping-list-details__edit-actions">
              <button
                type="button"
                className="shopping-list-details__edit-cancel"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="shopping-list-details__edit-save"
              >
                Salvar
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="shopping-list-details__item-info">
              <label className="shopping-list-details__item-label">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => onToggleItem(item.id)}
                />
                <span className="shopping-list-details__item-name">
                  {item.name}
                </span>
              </label>

              <span className="shopping-list-details__item-quantity">
                {item.quantity} {item.unit}
              </span>

              <span className="shopping-list-details__item-price">
                {item.unitPrice == null
                  ? 'Preço não informado'
                  : `${currencyFormatter.format(item.unitPrice)} / ${item.unit}`}
              </span>

              <div className="shopping-list-details__item-subtotal">
                <span>Subtotal:</span>

                <strong>
                  {subtotal === null
                    ? 'Não calculado'
                    : currencyFormatter.format(subtotal)}
                </strong>
              </div>

              <span className="shopping-list-details__item-category">
                {CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.outros}
              </span>
            </div>

            <div className="shopping-list-details__item-actions">
              <button
                type="button"
                className="shopping-list-details__item-edit"
                onClick={() => handleStartEdit(item)}
                aria-label={`Editar produto ${item.name}`}
              >
                Editar
              </button>
              <button
                type="button"
                className="shopping-list-details__item-delete"
                onClick={() => onDeleteItem(item.id)}
                aria-label={`Excluir produto ${item.name}`}
              >
                Excluir
              </button>
            </div>
          </>
        )}
      </div>
    )
  }



  return (
    <section className="shopping-list-details">
      <button
        type="button"
        className="shopping-list-details__back"
        onClick={onBack}
      >
        ← Voltar
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

      <section
        className="shopping-list-details__financial-summary"
        aria-label="Resumo financeiro da lista"
      >
        <div className="shopping-list-details__financial-header">
          <span aria-hidden="true">💰</span>
          <h3>Resumo financeiro</h3>
        </div>

        <div className="shopping-list-details__budget">
          <div className="shopping-list-details__budget-header">
            <div>
              <span>Orçamento definido</span>
              <strong>
                {budget === null
                  ? 'Não definido'
                  : currencyFormatter.format(budget)}
              </strong>
            </div>
            <button type="button" onClick={handleStartBudgetEdit}>
              {budget === null ? '+ Definir' : 'Editar'}
            </button>
          </div>

          {/* Indicadores de orçamento */}
          {hasBudget && budgetBalance !== null && (
            <div
              className={`shopping-list-details__budget-indicators shopping-list-details__budget-indicators--${budgetStatus}`}
            >
              <div className="shopping-list-details__budget-balance">
                <span>
                  {budgetBalance < 0
                    ? 'Orçamento ultrapassado'
                    : 'Saldo disponível'}
                </span>

                <strong>
                  {currencyFormatter.format(
                    Math.abs(budgetBalance)
                  )}
                </strong>
              </div>

              <div className="shopping-list-details__budget-progress">
                <div className="shopping-list-details__budget-progress-header">
                  <span>Orçamento utilizado</span>

                  <strong>
                    {budget === 0 && estimatedTotal > 0
                      ? 'Acima de 100%'
                      : `${Math.round(budgetPercentage)}%`}
                  </strong>
                </div>

                <div
                  className="shopping-list-details__budget-progress-track"
                  role="progressbar"
                  aria-label="Utilização do orçamento"
                  aria-valuenow={budgetProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="shopping-list-details__budget-progress-fill"
                    style={{ width: `${budgetProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Alertas de orçamento */}
          {hasBudget && (
            <div
              className={`shopping-list-details__budget-alert shopping-list-details__budget-alert--${budgetStatus}`}
              role="status"
            >
              {budgetStatus === 'safe' && (
                <p>
                  ✓ Seu orçamento está dentro do limite
                  planejado.
                </p>
              )}

              {budgetStatus === 'warning' && (
                <p>
                  ⚠️ Atenção! Você está próximo do limite
                  do orçamento.
                </p>
              )}

              {budgetStatus === 'exceeded' && (
                <p>
                  🚨 Seu orçamento foi ultrapassado!
                  Considere revisar os produtos da lista.
                </p>
              )}

              {itemsWithoutPrice > 0 && (
                <small>
                  Existem {itemsWithoutPrice}{' '}
                  {itemsWithoutPrice === 1
                    ? 'produto sem preço informado'
                    : 'produtos sem preço informado'}.
                  Os valores são parciais.
                </small>
              )}
            </div>
          )}

          {isBudgetEditing && (
            <form className="shopping-list-details__budget-form" onSubmit={handleSaveBudget}>
              <label htmlFor="list-budget">Limite de gastos (R$)</label>
              <input
                id="list-budget"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Ex.: 200,00"
                value={budgetInput}
                onChange={(event) => setBudgetInput(event.target.value)}
              />
              <small>Deixe vazio para remover o orçamento.</small>
              <div className="shopping-list-details__budget-actions">
                <button type="button" onClick={() => setIsBudgetEditing(false)}>
                  Cancelar
                </button>
                <button type="submit">Salvar orçamento</button>
              </div>
            </form>
          )}
        </div>

        <div className="shopping-list-details__financial-total">
          <span>
            {hasCompleteEstimate
              ? 'Total estimado'
              : 'Total conhecido até agora'}
          </span>

          <strong>
            {currencyFormatter.format(estimatedTotal)}
          </strong>
        </div>

        <div className="shopping-list-details__financial-breakdown">
          <div className="shopping-list-details__financial-card shopping-list-details__financial-card--purchased">
            <span>✓ Comprados</span>
            <strong>{currencyFormatter.format(purchasedTotal)}</strong>
            <small>Valor conhecido já comprado</small>
          </div>
          <div className="shopping-list-details__financial-card shopping-list-details__financial-card--pending">
            <span>◷ Pendentes</span>
            <strong>{currencyFormatter.format(pendingTotal)}</strong>
            <small>Valor conhecido ainda pendente</small>
          </div>
        </div>

        <div className="shopping-list-details__financial-progress">
          <div className="shopping-list-details__financial-progress-header">
            <span>Progresso financeiro</span>
            <strong>{Math.round(financialProgress)}%</strong>
          </div>
          <div
            className="shopping-list-details__financial-progress-track"
            role="progressbar"
            aria-label="Progresso financeiro das compras"
            aria-valuenow={Math.round(financialProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="shopping-list-details__financial-progress-fill"
              style={{ width: `${financialProgress}%` }}
            />
          </div>
          <small>Percentual do valor conhecido já comprado.</small>
        </div>

        {items.length === 0 ? (
          <p className="shopping-list-details__financial-info">
            Adicione produtos para começar seu orçamento.
          </p>
        ) : itemsWithoutPrice > 0 ? (
          <p className="shopping-list-details__financial-warning">
            ⚠️ {itemsWithoutPrice}{' '}
            {itemsWithoutPrice === 1
              ? 'produto ainda não possui preço.'
              : 'produtos ainda não possuem preço.'}
            {' '}O valor apresentado é parcial.
          </p>
        ) : (
          <p className="shopping-list-details__financial-success">
            ✓ Todos os produtos possuem preços cadastrados.
          </p>
        )}
      </section>

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
              {showAddForm ? 'Recolher ▲' : 'Mostrar ▼'}
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
              onChange={(event) => setItemName(event.target.value)}
            />

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
              ? '✓ Agrupamento ativado'
              : '▦ Agrupar por categoria'}
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
          <div className="shopping-list-details__empty">
            <span aria-hidden="true">🛒</span>
            <h3>Nenhum produto adicionado</h3>
            <p>Os produtos desta lista aparecerão aqui.</p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="shopping-list-details__empty">
            <span aria-hidden="true">🔎</span>
            <h3>Nenhum produto encontrado</h3>
            <p>Tente pesquisar outro nome ou alterar o filtro.</p>
          </div>
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
            {visibleItems.map(renderProduct)}
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

          {confirmAction !== null && (
            <div
              className="shopping-list-details__confirmation"
              role="group"
              aria-label="Confirmar ação na lista"
            >
              <p>
                {confirmAction === 'clear'
                  ? 'Remover todos os produtos comprados?'
                  : 'Desmarcar todos os produtos desta lista?'}
              </p>
              <div className="shopping-list-details__confirmation-actions">
                <button type="button" onClick={() => setConfirmAction(null)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="shopping-list-details__confirm-button"
                  onClick={handleConfirmAction}
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Total no rodapé da lista. */}
      {items.length > 0 && (
        <footer className="shopping-list-details__receipt" aria-label="Total da lista">
          <div className="shopping-list-details__receipt-heading">
            <span>🧾 Fechamento da lista</span>
            <span>{totalItems} {totalItems === 1 ? 'produto' : 'produtos'}</span>
          </div>
          <div className="shopping-list-details__receipt-line">
            <span>Comprados</span>
            <span>{currencyFormatter.format(purchasedTotal)}</span>
          </div>
          <div className="shopping-list-details__receipt-line">
            <span>Pendentes</span>
            <span>{currencyFormatter.format(pendingTotal)}</span>
          </div>
          <div className="shopping-list-details__receipt-total">
            <span>{hasCompleteEstimate ? 'TOTAL ESTIMADO' : 'TOTAL CONHECIDO'}</span>
            {/* Resumo do orçamento no cupom */}
            {budget !== null && (
              <div className="shopping-list-details__receipt-budget">
                <div className="shopping-list-details__receipt-line">
                  <span>Orçamento planejado</span>
                  <span>
                    {currencyFormatter.format(budget)}
                  </span>
                </div>

                {budgetSummary && (
                  <div
                    className={`shopping-list-details__receipt-budget-result shopping-list-details__receipt-budget-result--${budgetSummary.type}`}
                  >
                    <strong>{budgetSummary.title}</strong>
                    <p>{budgetSummary.message}</p>
                  </div>
                )}
              </div>
            )}
            <strong>{currencyFormatter.format(estimatedTotal)}</strong>
          </div>
          
          {/* Aviso sobre preços incompletos */}
          {itemsWithoutPrice > 0 && (
            <div className="shopping-list-details__receipt-incomplete">
              <span aria-hidden="true">⚠️</span>

              <div>
                <strong>Estimativa incompleta</strong>

                <p>
                  {itemsWithoutPrice}{' '}
                  {itemsWithoutPrice === 1
                    ? 'produto ainda não possui preço informado.'
                    : 'produtos ainda não possuem preços informados.'}
                </p>

                <small>
                  O total e a comparação com o orçamento
                  consideram apenas os valores conhecidos.
                </small>
              </div>
            </div>
          )}
          <p className="shopping-list-details__receipt-footer">Obrigado por organizar suas compras com o CarrinhoCheio!</p>
        </footer>
      )}
    </section>
  )
}

export default ShoppingListDetails
