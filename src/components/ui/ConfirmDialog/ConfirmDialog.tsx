import { useEffect, useId, useRef } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import Button from '../Button/Button'
import './ConfirmDialog.css'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  danger = true
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      cancelRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      onClose={() => {
        if (open) onCancel()
      }}
    >
      <div className="confirm-dialog__content">
        <button
          type="button"
          className="confirm-dialog__close"
          aria-label="Fechar confirmação"
          onClick={onCancel}
        >
          <X size={19} aria-hidden="true" />
        </button>

        <div className="confirm-dialog__icon" aria-hidden="true">
          <AlertTriangle size={25} />
        </div>

        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>{description}</p>

        <div className="confirm-dialog__actions">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
