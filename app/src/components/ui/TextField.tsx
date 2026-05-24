import type { InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  helperText?: string
  label: string
}

export function TextField({ className = '', helperText, label, ...props }: TextFieldProps) {
  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      <input {...props} />
      {helperText ? <small>{helperText}</small> : null}
    </label>
  )
}
