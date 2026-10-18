import type { ReactNode } from 'react'
import './EmptyState.css'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-state__icon" aria-hidden="true">{icon}</div>
      <h3 className="ui-empty-state__title">{title}</h3>
      <p className="ui-empty-state__description">{description}</p>
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  )
}
