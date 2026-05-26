import { useState } from 'react'
import { Button } from './Button'

type TagInputProps = {
  helperText?: string
  label?: string
  maxTags?: number
  onChange: (tags: string[]) => void
  placeholder?: string
  tags: string[]
}

export function TagInput({
  helperText,
  label = 'タグ',
  maxTags = 5,
  onChange,
  placeholder = '例: ラジオ',
  tags,
}: TagInputProps) {
  const [value, setValue] = useState('')

  const addTag = () => {
    const nextTag = value.trim().replace(/^#/, '')
    if (!nextTag || tags.includes(nextTag) || tags.length >= maxTags) {
      setValue('')
      return
    }

    onChange([...tags, nextTag])
    setValue('')
  }

  return (
    <div className="grid gap-3">
      <span className="text-text-heading font-black">{label}</span>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
          className="w-full box-border border-2 border-[#f1e7dc] rounded-md px-4 py-3.5 bg-[#fffaf4] text-text-heading font-[inherit]"
        />
        <Button type="button" variant="secondary" onClick={addTag}>
          追加
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <button
              type="button"
              key={tag}
              className="border-0 rounded-full px-[11px] py-[7px] bg-[#eafffb] text-[#1598a5] text-sm font-extrabold cursor-pointer font-[inherit]"
              onClick={() => onChange(tags.filter((currentTag) => currentTag !== tag))}
            >
              #{tag}
            </button>
          ))
        ) : (
          <small className="text-[#8d8d8d] text-xs">
            {helperText ?? `最大${maxTags}個まで。タップで削除できます。`}
          </small>
        )}
      </div>
    </div>
  )
}
