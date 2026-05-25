import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  helperText?: string
  label: string
}

export function Textarea({ className = '', helperText, label, ...props }: TextareaProps) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      <textarea {...props} />
      {helperText ? <small>{helperText}</small> : null}
    </label>
  )
}
