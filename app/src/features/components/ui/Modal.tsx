import type { ReactNode } from 'react'
import { Button } from './Button'

type ModalProps = {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title: string
}

export function Modal({ children, isOpen, onClose, title }: ModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="absolute inset-0 z-10 grid place-items-center p-6 bg-text-h/34"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="w-full rounded-lg p-5 bg-white shadow-default"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-3 mb-3">
          <h2 id="modal-title" className="text-text-h">
            {title}
          </h2>
          <Button type="button" variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </div>
        {children}
      </section>
    </div>
  )
}
