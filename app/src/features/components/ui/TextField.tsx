import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

type BaseProps = {
  label: string
  helperText?: string
}

type TextFieldProps = BaseProps &
  InputHTMLAttributes<HTMLInputElement> & {
    multiline?: false
  }

type TextAreaFieldProps = BaseProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    multiline: true
  }

const inputClasses =
  'w-full box-border border-2 border-border rounded-md px-4 py-3.5 bg-cream-light text-text-h font-[inherit]'

export function TextField(props: TextFieldProps | TextAreaFieldProps) {
  const { label, helperText, multiline, className = '', ...fieldProps } = props

  return (
    <label className={`grid gap-3 ${className}`.trim()}>
      <span className="text-text-h font-black">{label}</span>
      {multiline ? (
        <textarea
          className={`${inputClasses} resize-y`}
          {...(fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input className={inputClasses} {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {helperText ? <small className="text-[#8d8d8d] text-xs">{helperText}</small> : null}
    </label>
  )
}
