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
    <div
      className="fixed md:fixed inset-0 z-10 grid place-items-center p-6 bg-[rgba(31,31,31,0.34)]"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="w-full rounded-[28px] p-5 bg-white shadow-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-3 mb-3">
          <h2 id="modal-title" className="m-0 text-text-heading">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="w-8 h-8 flex items-center justify-center rounded-full text-text hover:text-text-heading hover:bg-[#f1e7dc] transition-colors text-lg font-bold leading-none border-none bg-transparent cursor-pointer"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
