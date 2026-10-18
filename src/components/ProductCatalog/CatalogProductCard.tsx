import { Pencil, Trash2, Package } from 'lucide-react'
import type { CatalogProduct } from '../../types/CatalogProduct'
import type { ShoppingItem } from '../../types/ShoppingItem'
import { CATEGORY_LABELS } from '../../data/productCategories'
import { getHistoricalAverage, formatMoney } from '../../utils/productPrices'

type Props = {
  product: CatalogProduct
  shoppingItems: ShoppingItem[]
  onEdit: (product: CatalogProduct) => void
  onDelete: (id: string) => void
}

export default function CatalogProductCard({ product, shoppingItems, onEdit, onDelete }: Props) {
  const average = product.unitPrice == null
    ? getHistoricalAverage(shoppingItems, product.name, product.defaultUnit)
    : null

  const priceLabel = product.unitPrice != null
    ? `Preço cadastrado: ${formatMoney(product.unitPrice)} / ${product.defaultUnit}`
    : average !== null
      ? `Média do seu histórico: ${formatMoney(average)} / ${product.defaultUnit}`
      : 'Preço não informado · média indisponível'

  return (
    <article className="product-catalog__item">
      <div className="product-catalog__item-main">
        <span className="product-catalog__item-icon" aria-hidden="true"><Package size={21} /></span>
        <div className="product-catalog__item-info">
          <strong>{product.name}</strong>
          <span>{CATEGORY_LABELS[product.category]} · {product.defaultUnit}</span>
          <span className="product-catalog__price">{priceLabel}</span>
        </div>
      </div>
      <div className="product-catalog__item-actions">
        <button type="button" className="product-catalog__edit" onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`} title={`Editar ${product.name}`}>
          <Pencil size={17} aria-hidden="true" /><span>Editar</span>
        </button>
        <button type="button" className="product-catalog__delete" onClick={() => onDelete(product.id)} aria-label={`Excluir ${product.name}`} title={`Excluir ${product.name}`}>
          <Trash2 size={17} aria-hidden="true" /><span>Excluir</span>
        </button>
      </div>
    </article>
  )
}
