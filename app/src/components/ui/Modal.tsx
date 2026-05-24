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
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="section-title-row">
          <h2 id="modal-title">{title}</h2>
          <Button type="button" variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </div>
        {children}
      </section>
    </div>
  )
}
