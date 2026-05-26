import type { InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  helperText?: string
  label: string
}

export function TextField({ className = '', helperText, label, ...props }: TextFieldProps) {
  return (
    <label className={`grid gap-3 ${className}`.trim()}>
      <span className="text-text-heading font-black">{label}</span>
      <input
        {...props}
        className="w-full box-border border-2 border-[#f1e7dc] rounded-md px-4 py-3.5 bg-[#fffaf4] text-text-heading font-[inherit]"
      />
      {helperText ? <small className="text-[#8d8d8d] text-xs">{helperText}</small> : null}
    </label>
  )
}
