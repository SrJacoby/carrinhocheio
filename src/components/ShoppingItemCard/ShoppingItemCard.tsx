import { useState } from 'react'
import type { FormEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { ShoppingItem } from '../../types/ShoppingItem'
import type { ProductCategory } from '../../types/ProductCategory'
import type { CatalogProduct } from '../../types/CatalogProduct'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../../data/productCategories'
import { getHistoricalAverage, formatMoney } from '../../utils/productPrices'
import { calculateSubtotal, currencyFormatter } from '../../utils/shoppingCalculations'
import './ShoppingItemCard.css'

type ShoppingItemCardProps = {
  item: ShoppingItem
  catalogProducts: CatalogProduct[]
  historicalItems: ShoppingItem[]
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

export default function ShoppingItemCard({
  item,
  catalogProducts,
  historicalItems,
  onToggleItem,
  onDeleteItem,
  onEditItem
}: ShoppingItemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [editedQuantity, setEditedQuantity] = useState('1')
  const [editedUnit, setEditedUnit] = useState('un')
  const [editedCategory, setEditedCategory] =
    useState<ProductCategory>('outros')
  const [editedUnitPrice, setEditedUnitPrice] = useState('')

  function handleStartEdit(item: ShoppingItem) {
    setIsEditing(true)
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
    setIsEditing(false)
  }

  function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isEditing) return

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

    onEditItem(item.id, name, quantityNumber, editedUnit, editedCategory, editedPriceNumber)
    setIsEditing(false)
  }

  const subtotal = calculateSubtotal(item.quantity, item.unitPrice)
  return (
      <div
        className={`shopping-list-details__item ${
          item.checked ? 'shopping-list-details__item--checked' : ''
        }`}
      >
        {isEditing ? (
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
            <div className="shopping-list-details__item-info shopping-list-details__item-info--refined">
              <div className="shopping-list-details__item-topline">
                <label className="shopping-list-details__item-label">
                  <input type="checkbox" checked={item.checked}
                    onChange={() => onToggleItem(item.id)} />
                  <span className="shopping-list-details__item-name">{item.name}</span>
                </label>
                <span className="shopping-list-details__item-category">
                  {CATEGORY_LABELS[item.category] ?? CATEGORY_LABELS.outros}
                </span>
              </div>
              <div className="shopping-list-details__item-meta">
                <span className="shopping-list-details__item-quantity">{item.quantity} {item.unit}</span>
                <span className="shopping-list-details__item-price">
                  {item.unitPrice == null
                    ? 'Preço não informado'
                    : `${currencyFormatter.format(item.unitPrice)} / ${item.unit}`}
                </span>
              </div>
              {item.unitPrice == null && (() => {
                const catalogPrice = catalogProducts.find((product) =>
                  product.name.trim().toLocaleLowerCase('pt-BR') === item.name.trim().toLocaleLowerCase('pt-BR') &&
                  product.defaultUnit === item.unit
                )?.unitPrice
                const average = getHistoricalAverage(historicalItems, item.name, item.unit)
                const suggestion = catalogPrice ?? average
                return suggestion == null ? null : (
                  <small className="shopping-list-details__price-hint">
                    {catalogPrice != null ? 'Preço do catálogo' : 'Média do histórico'}: {formatMoney(suggestion)} / {item.unit}
                    {' '}· Valor sugerido, não incluído no total
                  </small>
                )
              })()}
              <div className="shopping-list-details__item-subtotal">
                <span>Subtotal</span>
                <strong>{subtotal === null ? 'Não calculado' : currencyFormatter.format(subtotal)}</strong>
              </div>
            </div>

            <div className="shopping-list-details__item-actions">
              <button
                type="button"
                className="shopping-list-details__item-edit"
                onClick={() => handleStartEdit(item)}
                aria-label={`Editar produto ${item.name}`}
              >
                <Pencil size={17} aria-hidden="true" />
                Editar
              </button>
              <button
                type="button"
                className="shopping-list-details__item-delete"
                onClick={() => onDeleteItem(item.id)}
                aria-label={`Excluir produto ${item.name}`}
              >
                <Trash2 size={17} aria-hidden="true" />
                Excluir
              </button>
            </div>
          </>
        )}
      </div>
    )
}
