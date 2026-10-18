import type { CatalogProduct } from '../../types/CatalogProduct'
import './ProductSuggestions.css'

type ProductSuggestionsProps = {
  search: string
  products: CatalogProduct[]
  onSelect: (product: CatalogProduct) => void
}

function normalizeText(text: string): string {
  return text.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

export default function ProductSuggestions({ search, products, onSelect }: ProductSuggestionsProps) {
  const normalizedSearch = normalizeText(search)
  if (normalizedSearch.length < 2) return null

  const suggestions = products
    .filter((product) => normalizeText(product.name).includes(normalizedSearch))
    .slice(0, 5)

  if (suggestions.length === 0) return null

  return (
    <div className="product-suggestions" aria-label="Sugestões de produtos">
      <span className="product-suggestions__title">Sugestões do catálogo</span>
      <div className="product-suggestions__list">
        {suggestions.map((product) => (
          <button key={product.id} type="button" className="product-suggestions__item" onClick={() => onSelect(product)}>
            <span>{product.name}</span>
            <small>{product.defaultUnit}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
