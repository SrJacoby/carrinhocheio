import { normalizeText } from '../../utils/normalizeText'
import { useState } from 'react'
import { PackagePlus } from 'lucide-react'
import type { FormEvent } from 'react'
import type { CatalogProduct } from '../../types/CatalogProduct'
import './CatalogProductPicker.css'

type CatalogProductPickerProps = {
  products: CatalogProduct[]
  onAddProduct: (product: CatalogProduct, quantity: number) => void
}

function CatalogProductPicker({
  products,
  onAddProduct
}: CatalogProductPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('1')

  const selectedProduct = products.find((product) => product.id === selectedId)
  const filteredProducts = products.filter((product) =>
    normalizeText(product.name).includes(normalizeText(search))
  )

  function resetPicker() {
    setSearch('')
    setSelectedId(null)
    setQuantity('1')
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(quantity)

    if (!selectedProduct || !quantity.trim() ||
        !Number.isFinite(amount) || amount <= 0) return

    onAddProduct(selectedProduct, amount)
    resetPicker()
    setIsOpen(false)
  }

  return (
    <section className="catalog-picker" aria-label="Adicionar produto do catálogo">
      <button
        type="button"
        className="catalog-picker__toggle"
        aria-expanded={isOpen}
        aria-controls="catalog-picker-content"
        onClick={() => {
          resetPicker()
          setIsOpen((previous) => !previous)
        }}
      >
        <PackagePlus size={17} aria-hidden="true" />
        {isOpen ? 'Fechar catálogo' : 'Adicionar do catálogo'}
      </button>

      {isOpen && (
        <div id="catalog-picker-content" className="catalog-picker__content">
          <h3>Escolher produto do catálogo</h3>
          <label htmlFor="catalog-picker-search">Pesquisar produto</label>
          <input
            id="catalog-picker-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ex.: arroz, leite, café..."
          />

          <div className="catalog-picker__results">
            {filteredProducts.length === 0 ? (
              <p>{products.length === 0
                ? 'O catálogo ainda não possui produtos cadastrados.'
                : 'Nenhum produto encontrado.'}</p>
            ) : filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                aria-pressed={selectedId === product.id}
                className={`catalog-picker__product${
                  selectedId === product.id ? ' catalog-picker__product--selected' : ''
                }`}
                onClick={() => setSelectedId(product.id)}
              >
                <span>{product.name}</span>
                <small>{product.defaultUnit}</small>
              </button>
            ))}
          </div>

          {selectedProduct && (
            <form className="catalog-picker__form" onSubmit={handleSubmit}>
              <div className="catalog-picker__selection">
                <strong>{selectedProduct.name}</strong>
                <span>Unidade: {selectedProduct.defaultUnit}</span>
              </div>
              <label htmlFor="catalog-picker-quantity">Quantidade</label>
              <input
                id="catalog-picker-quantity"
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
              />
              <button type="submit">Adicionar à lista</button>
            </form>
          )}
        </div>
      )}
    </section>
  )
}

export default CatalogProductPicker
