import type { CatalogProduct } from '../types/CatalogProduct'

// Produtos iniciais do catálogo.
export const initialCatalog: CatalogProduct[] = [
  {
    id: 'catalog-arroz',
    name: 'Arroz branco',
    category: 'outros',
    defaultUnit: 'kg'
  },
  {
    id: 'catalog-feijao',
    name: 'Feijão preto',
    category: 'outros',
    defaultUnit: 'kg'
  },
  {
    id: 'catalog-leite',
    name: 'Leite integral',
    category: 'laticinios',
    defaultUnit: 'L'
  },
  {
    id: 'catalog-queijo',
    name: 'Queijo',
    category: 'laticinios',
    defaultUnit: 'kg'
  },
  {
    id: 'catalog-banana',
    name: 'Banana',
    category: 'hortifruti',
    defaultUnit: 'kg'
  },
  {
    id: 'catalog-tomate',
    name: 'Tomate',
    category: 'hortifruti',
    defaultUnit: 'kg'
  },
  {
    id: 'catalog-frango',
    name: 'Frango',
    category: 'carnes',
    defaultUnit: 'kg'
  },
  {
    id: 'catalog-pao',
    name: 'Pão francês',
    category: 'padaria',
    defaultUnit: 'un'
  },
  {
    id: 'catalog-detergente',
    name: 'Detergente',
    category: 'limpeza',
    defaultUnit: 'un'
  },
  {
    id: 'catalog-sabao',
    name: 'Sabão em pó',
    category: 'limpeza',
    defaultUnit: 'kg'
  }
]
