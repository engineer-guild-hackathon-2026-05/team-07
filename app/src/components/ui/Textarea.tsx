import type { TextareaHTMLAttributes } from 'react'
import { TextField } from '../../features/components/ui/TextField'

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> & {
  helperText?: string
  label: string
}

export function Textarea(props: TextareaProps) {
  return <TextField {...props} multiline />
}
