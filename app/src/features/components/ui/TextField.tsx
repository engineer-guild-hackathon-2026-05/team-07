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

export function TextField(props: TextFieldProps | TextAreaFieldProps) {
  const { label, helperText, multiline, className = '', ...fieldProps } = props

  return (
    <label className={`field ${className}`.trim()}>
      <span>{label}</span>
      {multiline ? (
        <textarea {...(fieldProps as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...(fieldProps as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {helperText ? <small>{helperText}</small> : null}
    </label>
  )
}
