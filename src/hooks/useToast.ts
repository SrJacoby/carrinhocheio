import { useCallback, useRef, useState } from 'react'
import type { ToastMessage, ToastType } from '../components/ui/Toast/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const nextId = useRef(0)
  const removeToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id))
  }, [])
  const showToast = useCallback((type: ToastType, title: string, description?: string) => {
    const id = ++nextId.current
    setToasts((previous) => [...previous.slice(-2), { id, type, title, description }])
  }, [])
  return { toasts, showToast, removeToast }
}
