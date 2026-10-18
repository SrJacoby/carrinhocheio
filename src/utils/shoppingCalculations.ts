export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

export function calculateSubtotal(quantity: number, unitPrice?: number | null): number | null {
  if (unitPrice == null || !Number.isFinite(quantity) || !Number.isFinite(unitPrice) || quantity <= 0 || unitPrice < 0) {
    return null
  }
  return quantity * unitPrice
}
