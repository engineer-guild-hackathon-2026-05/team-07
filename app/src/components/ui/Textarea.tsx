import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  helperText?: string
  label: string
}

export function Textarea({ className = '', helperText, label, ...props }: TextareaProps) {
  return (
    <label className={`grid gap-3 ${className}`.trim()}>
      <span className="text-text-heading font-black">{label}</span>
      <textarea
        {...props}
        className="w-full box-border border-2 border-[#f1e7dc] rounded-md px-4 py-3.5 bg-[#fffaf4] text-text-heading font-[inherit] resize-y"
      />
      {helperText ? <small className="text-[#8d8d8d] text-xs">{helperText}</small> : null}
    </label>
  )
}
