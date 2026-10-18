import {
  ShoppingCart,
  House,
  ChevronRight
} from 'lucide-react'

import './AppHeader.css'

type AppHeaderProps = {
  currentList?: string | null
  onGoHome?: () => void
}

export default function AppHeader({
  currentList = null,
  onGoHome
}: AppHeaderProps) {
  const isInsideList = Boolean(currentList)

  return (
    <header className="app-header">
      <div className="app-header__main">
        <div className="app-header__brand">
          <div className="app-header__logo">
            <ShoppingCart
              size={26}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <div className="app-header__identity">
            <h1>CarrinhoCheio</h1>
            <p>Suas compras, organizadas.</p>
          </div>
        </div>

        <button
          type="button"
          className="app-header__home"
          onClick={onGoHome}
          disabled={!isInsideList}
          aria-label="Voltar para a página inicial"
          title="Página inicial"
        >
          <House size={19} aria-hidden="true" />
          <span>Início</span>
        </button>
      </div>

      {isInsideList && (
        <nav
          className="app-header__breadcrumb"
          aria-label="Localização atual"
        >
          <button
            type="button"
            onClick={onGoHome}
          >
            <House size={15} aria-hidden="true" />
            Início
          </button>

          <ChevronRight
            size={15}
            aria-hidden="true"
          />

          <span aria-current="page">
            {currentList}
          </span>
        </nav>
      )}
    </header>
  )
}
