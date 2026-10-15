import { useState } from 'react'
import type { FormEvent } from 'react'
import type { ShoppingItem } from '../../types/ShoppingItem'
import type { ProductCategory } from '../../types/ProductCategory'
import './ShoppingListDetails.css'

/* ========================================
   1. TIPOS E CONFIGURAÇÕES
======================================== */

type ShoppingListDetailsProps = {
  title: string
  items: ShoppingItem[]
  onBack: () => void
  onAddItem: (
    name: string,
    quantity: number,
    unit: string,
    category: ProductCategory
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
    category: ProductCategory
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

/* ========================================
   2. COMPONENTE PRINCIPAL
======================================== */

function ShoppingListDetails({
  title,
  items,
  onBack,
  onAddItem,
  onClearCompleted,
  onResetList,
  onToggleItem,
  onDeleteItem,
  onEditItem
}: ShoppingListDetailsProps) {
  // Cadastro de produtos
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [unit, setUnit] = useState('un')
  const [category, setCategory] = useState<ProductCategory>('outros')

  // Lista vazia abre o formulário; após adicionar, ele permanece aberto.
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const showAddForm = items.length === 0 || isAddFormOpen

  // Pesquisa, filtros, ordenação e agrupamento opcional
  const [searchTerm, setSearchTerm] = useState('')
  const [productFilter, setProductFilter] = useState<ProductFilter>('all')
  const [productSort, setProductSort] = useState<ProductSort>('pending')
  const [groupByCategory, setGroupByCategory] = useState(false)

  // Edição de produtos
  // Confirmações para operações que alteram vários produtos.
  const [confirmAction, setConfirmAction] = useState<'clear' | 'reset' | null>(null)

  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editedName, setEditedName] = useState('')
  const [editedQuantity, setEditedQuantity] = useState('1')
  const [editedUnit, setEditedUnit] = useState('un')
  const [editedCategory, setEditedCategory] =
    useState<ProductCategory>('outros')

  /* ========================================
     3. CADASTRO E EDIÇÃO
  ======================================== */

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = itemName.trim()
    const quantityNumber = Number(quantity)

    if (!name || !quantity.trim() || !Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      return
    }

    onAddItem(name, quantityNumber, unit, category)

    setItemName('')
    setQuantity('1')
    setUnit('un')
    setCategory('outros')
    setIsAddFormOpen(true)
  }

  function handleStartEdit(item: ShoppingItem) {
    setEditingItemId(item.id)
    setEditedName(item.name)
    setEditedQuantity(String(item.quantity))
    setEditedUnit(item.unit)
    setEditedCategory(item.category)
  }

  function handleCancelEdit() {
    setEditingItemId(null)
  }

  function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingItemId === null) return

    const name = editedName.trim()
    const quantityNumber = Number(editedQuantity)

    if (!name || !editedQuantity.trim() || !Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      return
    }

    onEditItem(editingItemId, name, quantityNumber, editedUnit, editedCategory)
    setEditingItemId(null)
  }

  /* ========================================
     4. PROGRESSO, ORDENAÇÃO E FILTROS
  ======================================== */

  const totalItems = items.length
  const completedItems = items.filter((item) => item.checked).length
  const hasCompletedItems = completedItems > 0
  const progress = totalItems === 0
    ? 0
    : Math.round((completedItems / totalItems) * 100)

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

  /* ========================================
     5. AGRUPAMENTO OPCIONAL POR CATEGORIA
     A lista tradicional permanece como padrão.
     Pesquisa, filtros e ordenação são preservados.
  ======================================== */

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

  /* ========================================
     6. PRODUTO REUTILIZÁVEL
     O mesmo JSX funciona nos dois modos de exibição.
  ======================================== */

  function renderProduct(item: ShoppingItem) {
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

  /* ========================================
     7. INTERFACE DO COMPONENTE
  ======================================== */

  return (
    <section className="shopping-list-details">
      {/* Navegação e cabeçalho */}
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

      {/* Progresso das compras */}
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

      {/* Aula 22: formulário de cadastro retrátil */}
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

            <button type="submit">+ Adicionar produto</button>
          </form>
        )}
      </div>

      {/* Ferramentas de consulta e listagem */}
      <div className="shopping-list-details__products">
        <h3>Produtos da lista ({items.length})</h3>

        {/* Pesquisa */}
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

        {/* Ordenação */}
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

        {/* Aula 20: agrupamento opcional */}
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

        {/* Filtros */}
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

        {/* Visualização tradicional ou agrupada */}
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

      {/* Aula 22: limpar comprados e reiniciar a lista */}
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
    </section>
  )
}

export default ShoppingListDetails