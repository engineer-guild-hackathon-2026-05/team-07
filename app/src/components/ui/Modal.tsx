import type { ReactNode } from 'react'

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
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[#494949] hover:text-[#1f1f1f] hover:bg-[#f1e7dc] transition-colors text-lg font-bold leading-none border-none bg-transparent cursor-pointer"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
