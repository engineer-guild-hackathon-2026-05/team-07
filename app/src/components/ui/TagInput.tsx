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
    <div className="field">
      <span>{label}</span>
      <div className="tag-input-row">
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
        />
        <Button type="button" variant="secondary" onClick={addTag}>
          追加
        </Button>
      </div>
      <div className="tag-list">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <button
              type="button"
              key={tag}
              className="tag-chip"
              onClick={() => onChange(tags.filter((currentTag) => currentTag !== tag))}
            >
              #{tag}
            </button>
          ))
        ) : (
          <small>{helperText ?? `最大${maxTags}個まで。タップで削除できます。`}</small>
        )}
      </div>
    </div>
  )
}
