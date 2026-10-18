import { AlertTriangle, ReceiptText } from 'lucide-react'
import { currencyFormatter } from '../../utils/shoppingCalculations'

type BudgetSummary = { type: string; title: string; message: string } | null

type Props = {
  totalItems: number
  completedItems: number
  progress: number
  purchasedTotal: number
  pendingTotal: number
  estimatedTotal: number
  hasCompleteEstimate: boolean
  budget: number | null
  budgetBalance: number | null
  budgetSummary: BudgetSummary
  itemsWithoutPrice: number
}

export default function ShoppingReceipt({ totalItems, completedItems, progress, purchasedTotal, pendingTotal, estimatedTotal, hasCompleteEstimate, budget, budgetBalance, budgetSummary, itemsWithoutPrice }: Props) {
  return (
        <footer className="shopping-list-details__receipt" aria-label="Total da lista">
          <div className="shopping-list-details__receipt-heading">
            <span><ReceiptText size={18} aria-hidden="true" /> Fechamento da lista</span>
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
            <strong>{currencyFormatter.format(estimatedTotal)}</strong>
          </div>
          <div className="shopping-list-details__receipt-financial">
            <div className="shopping-list-details__receipt-line">
              <span>Produtos comprados</span>
              <strong>{completedItems} de {totalItems} ({progress}%)</strong>
            </div>
            <div className="shopping-list-details__receipt-line">
              <span>Progresso financeiro dos preços conhecidos</span>
              <strong>{estimatedTotal > 0 ? Math.round(purchasedTotal / estimatedTotal * 100) : 0}%</strong>
            </div>
            {budget !== null && (
              <>
                <div className="shopping-list-details__receipt-line">
                  <span>Orçamento planejado</span>
                  <strong>{currencyFormatter.format(budget)}</strong>
                </div>
                <div className="shopping-list-details__receipt-line">
                  <span>{budgetBalance !== null && budgetBalance < 0 ? 'Valor excedido' : 'Saldo disponível'}</span>
                  <strong>{currencyFormatter.format(Math.abs(budgetBalance ?? 0))}</strong>
                </div>
                <div className="shopping-list-details__receipt-line">
                  <span>Orçamento utilizado (valores conhecidos)</span>
                  <strong>{budget === 0 ? (estimatedTotal > 0 ? 'Acima de 100%' : '0%') : `${Math.round(estimatedTotal / budget * 100)}%`}</strong>
                </div>
                {budgetSummary && (
                  <div className={`shopping-list-details__receipt-budget-result shopping-list-details__receipt-budget-result--${budgetSummary.type}`}>
                    <strong>{budgetSummary.title}</strong>
                    <p>{budgetSummary.message}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Aviso sobre preços incompletos */}
          {itemsWithoutPrice > 0 && (
            <div className="shopping-list-details__receipt-incomplete">
              <AlertTriangle size={18} aria-hidden="true" />

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
  )
}
