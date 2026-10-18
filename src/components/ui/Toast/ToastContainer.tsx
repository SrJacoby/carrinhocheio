import Toast from './Toast'
import type { ToastMessage } from './Toast'

type Props = { toasts: ToastMessage[]; onClose: (id: number) => void }

export default function ToastContainer({ toasts, onClose }: Props) {
  return (
    <div className="ui-toast-container" aria-label="Notificações">
      {toasts.map((toast) => <Toast key={toast.id} toast={toast} onClose={onClose} />)}
    </div>
  )
}
