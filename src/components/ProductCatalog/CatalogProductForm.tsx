import { Check, X } from 'lucide-react'
import type { FormEvent } from 'react'
import type { CatalogProduct } from '../../types/CatalogProduct'
import { CATEGORY_OPTIONS } from '../../data/productCategories'

type Props = {
  name: string
  category: CatalogProduct['category']
  defaultUnit: string
  unitPrice: string
  editing: boolean
  feedback: string
  onNameChange: (value: string) => void
  onCategoryChange: (value: CatalogProduct['category']) => void
  onUnitChange: (value: string) => void
  onPriceChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

const UNITS = ['un', 'kg', 'g', 'L', 'mL']

export default function CatalogProductForm({
  name, category, defaultUnit, unitPrice, editing, feedback,
  onNameChange, onCategoryChange, onUnitChange, onPriceChange,
  onSubmit, onCancel
}: Props) {
  return (
    <form className="product-catalog__form" onSubmit={onSubmit}>
      <div className="product-catalog__form-heading">
        <div>
          <h3>{editing ? 'Editar produto' : 'Cadastrar produto'}</h3>
          <p>Preencha as informações para reutilizar este produto nas suas listas.</p>
        </div>
      </div>

      <div className="product-catalog__form-fields">
        <label>
          Nome do produto
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={100}
            placeholder="Ex.: Arroz branco"
            autoFocus
            required
          />
        </label>
        <label>
          Categoria
          <select value={category} onChange={(event) => onCategoryChange(event.target.value as CatalogProduct['category'])}>
            {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          Unidade padrão
          <select value={defaultUnit} onChange={(event) => onUnitChange(event.target.value)}>
            {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </label>
        <label>
          Preço unitário (R$) · opcional
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={unitPrice}
            onChange={(event) => onPriceChange(event.target.value)}
            placeholder="Ex.: 12,90"
          />
        </label>
      </div>

      <p className="product-catalog__form-hint">
        Sem preço cadastrado? O CarrinhoCheio pode mostrar uma média do seu histórico de compras, quando disponível.
      </p>

      <div className="product-catalog__form-actions">
        <button type="submit" className="product-catalog__submit">
          <Check size={17} aria-hidden="true" />
          {editing ? 'Salvar alterações' : 'Cadastrar produto'}
        </button>
        <button type="button" className="product-catalog__secondary" onClick={onCancel}>
          <X size={17} aria-hidden="true" /> Cancelar
        </button>
      </div>
      {feedback && <p className="product-catalog__feedback" role="status">{feedback}</p>}
    </form>
  )
}
