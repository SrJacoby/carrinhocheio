import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Boxes, Layers3, ListFilter, Plus, Search, SlidersHorizontal, X, PackageSearch } from 'lucide-react'
import type { CatalogProduct } from '../../types/CatalogProduct'
import type { ShoppingItem } from '../../types/ShoppingItem'
import type { CatalogSaveResult } from '../../hooks/useProductCatalog'
import { CATEGORY_OPTIONS } from '../../data/productCategories'
import { normalizeText } from '../../utils/normalizeText'
import EmptyState from '../ui/EmptyState/EmptyState'
import ConfirmDialog from '../ui/ConfirmDialog/ConfirmDialog'
import CatalogProductForm from './CatalogProductForm'
import CatalogProductCard from './CatalogProductCard'
import './ProductCatalog.css'

type Category = CatalogProduct['category']
type CatalogSort = 'name-asc' | 'name-desc' | 'category'

type Props = {
  products: CatalogProduct[]
  shoppingItems: ShoppingItem[]
  onAddProduct: (name: string, category: Category, defaultUnit: string, unitPrice?: number | null) => CatalogSaveResult
  onEditProduct: (id: string, name: string, category: Category, defaultUnit: string, unitPrice?: number | null) => CatalogSaveResult
  onDeleteProduct: (id: string) => void
  onNotify?: (type: 'success' | 'error' | 'info', title: string) => void
}

export function ProductCatalog({ products, shoppingItems, onAddProduct, onEditProduct, onDeleteProduct, onNotify }: Props) {
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('outros')
  const [defaultUnit, setDefaultUnit] = useState('un')
  const [unitPrice, setUnitPrice] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')
  const [sortBy, setSortBy] = useState<CatalogSort>('name-asc')
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null)

  const productToDelete = products.find((product) => product.id === productToDeleteId)
  const filtersActive = Boolean(searchTerm || categoryFilter !== 'all' || sortBy !== 'name-asc')

  const filteredProducts = useMemo(() => products
    .filter((product) =>
      normalizeText(product.name).includes(normalizeText(searchTerm)) &&
      (categoryFilter === 'all' || product.category === categoryFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'pt-BR')
      if (sortBy === 'category') {
        const aCategory = CATEGORY_OPTIONS.findIndex((option) => option.value === a.category)
        const bCategory = CATEGORY_OPTIONS.findIndex((option) => option.value === b.category)
        return aCategory - bCategory || a.name.localeCompare(b.name, 'pt-BR')
      }
      return a.name.localeCompare(b.name, 'pt-BR')
    }), [products, searchTerm, categoryFilter, sortBy])

  const usedCategories = new Set(products.map((product) => product.category)).size

  function resetForm() {
    setName('')
    setCategory('outros')
    setDefaultUnit('un')
    setUnitPrice('')
    setEditingId(null)
  }

  function closeForm() {
    resetForm()
    setFeedback('')
    setFormOpen(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const price = unitPrice.trim() === '' ? null : Number(unitPrice)
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      setFeedback('Informe um preço válido ou deixe o campo vazio.')
      return
    }
    const result = editingId
      ? onEditProduct(editingId, name, category, defaultUnit, price)
      : onAddProduct(name, category, defaultUnit, price)
    if (result === 'success') {
      const wasEditing = editingId !== null
      closeForm()
      setFeedback(wasEditing ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.')
      onNotify?.('success', wasEditing ? 'Produto atualizado' : 'Produto cadastrado')
    } else if (result === 'duplicate') {
      setFeedback('Já existe um produto com esse nome no catálogo.')
    } else {
      setFeedback('Informe um nome válido e uma unidade.')
    }
  }

  function handleStartEdit(product: CatalogProduct) {
    setEditingId(product.id)
    setName(product.name)
    setCategory(product.category)
    setDefaultUnit(product.defaultUnit)
    setUnitPrice(product.unitPrice == null ? '' : String(product.unitPrice))
    setFeedback('')
    setFormOpen(true)
  }

  function handleDeleteProduct() {
    if (!productToDeleteId) return
    onDeleteProduct(productToDeleteId)
    if (editingId === productToDeleteId) closeForm()
    setFeedback('Produto excluído do catálogo.')
    onNotify?.('success', 'Produto excluído do catálogo')
    setProductToDeleteId(null)
  }

  function clearFilters() {
    setSearchTerm('')
    setCategoryFilter('all')
    setSortBy('name-asc')
  }

  return (
    <section className="product-catalog" aria-label="Gerenciar catálogo de produtos">
      <header className="product-catalog__header">
        <div className="product-catalog__heading">
          <span className="product-catalog__heading-icon"><Boxes size={23} aria-hidden="true" /></span>
          <div>
            <h2>Catálogo de produtos</h2>
            <p>Gerencie seus produtos, unidades e preços em um só lugar.</p>
          </div>
        </div>
        <button type="button" className="product-catalog__new" onClick={() => formOpen ? closeForm() : (resetForm(), setFeedback(''), setFormOpen(true))} aria-expanded={formOpen}>
          {formOpen ? <X size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
          {formOpen ? 'Fechar cadastro' : 'Novo produto'}
        </button>
      </header>

      {formOpen && (
        <CatalogProductForm
          name={name}
          category={category}
          defaultUnit={defaultUnit}
          unitPrice={unitPrice}
          editing={editingId !== null}
          feedback={feedback}
          onNameChange={(value) => { setName(value); setFeedback('') }}
          onCategoryChange={setCategory}
          onUnitChange={setDefaultUnit}
          onPriceChange={setUnitPrice}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}
      {!formOpen && feedback && <p className="product-catalog__feedback" role="status">{feedback}</p>}

      <div className="product-catalog__stats" aria-label="Resumo do catálogo">
        <div className="product-catalog__stat"><Boxes size={19} aria-hidden="true" /><span>Produtos cadastrados</span><strong>{products.length}</strong></div>
        <div className="product-catalog__stat"><Layers3 size={19} aria-hidden="true" /><span>Categorias utilizadas</span><strong>{usedCategories}</strong></div>
        <div className="product-catalog__stat"><ListFilter size={19} aria-hidden="true" /><span>Resultados da pesquisa</span><strong>{filteredProducts.length}</strong></div>
      </div>

      <div className="product-catalog__browser">
        <div className="product-catalog__browser-title"><SlidersHorizontal size={18} aria-hidden="true" /><h3>Pesquisar e organizar</h3></div>
        <div className="product-catalog__filters">
          <label className="product-catalog__search">Pesquisar produtos
            <span className="product-catalog__search-control"><Search size={18} aria-hidden="true" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Pesquisar pelo nome..." /></span>
          </label>
          <label className="product-catalog__category-filter">Filtrar por categoria
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as Category | 'all')}>
              <option value="all">Todas as categorias</option>
              {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="product-catalog__sort">Ordenar produtos
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as CatalogSort)}>
              <option value="name-asc">Nome (A–Z)</option>
              <option value="name-desc">Nome (Z–A)</option>
              <option value="category">Categoria</option>
            </select>
          </label>
        </div>
      </div>

      <div className="product-catalog__results">
        <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}</span>
        {filtersActive && <button type="button" className="product-catalog__clear" onClick={clearFilters}><X size={15} aria-hidden="true" /> Limpar filtros</button>}
      </div>

      <div className="product-catalog__list">
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<PackageSearch />}
            title={products.length === 0 ? 'Seu catálogo está vazio' : 'Nenhum produto encontrado'}
            description={products.length === 0 ? 'Cadastre um produto para começar.' : 'Tente outra pesquisa ou limpe os filtros.'}
          />
        ) : filteredProducts.map((product) => (
          <CatalogProductCard key={product.id} product={product} shoppingItems={shoppingItems} onEdit={handleStartEdit} onDelete={setProductToDeleteId} />
        ))}
      </div>

      <ConfirmDialog
        open={productToDelete !== undefined}
        title="Excluir do catálogo?"
        description={`O produto "${productToDelete?.name ?? ''}" será removido do catálogo. Os itens já adicionados às listas serão mantidos.`}
        confirmLabel="Excluir produto"
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDeleteId(null)}
      />
    </section>
  )
}
