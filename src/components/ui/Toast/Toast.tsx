import { useEffect } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'info'
export type ToastMessage = { id: number; type: ToastType; title: string; description?: string }

type Props = { toast: ToastMessage; onClose: (id: number) => void }

export default function Toast({ toast, onClose }: Props) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onClose(toast.id), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast.id, onClose])

  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? CircleAlert : Info
  return (
    <div className={`ui-toast ui-toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <div className="ui-toast__icon"><Icon size={21} aria-hidden="true" /></div>
      <div className="ui-toast__content">
        <strong>{toast.title}</strong>
        {toast.description && <p>{toast.description}</p>}
      </div>
      <button type="button" className="ui-toast__close" onClick={() => onClose(toast.id)} aria-label="Fechar notificação"><X size={17} aria-hidden="true" /></button>
    </div>
  )
}
