import { useState } from 'react'
import { Button } from './Button'

type TagInputProps = {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [value, setValue] = useState('')

  const addTag = () => {
    const nextTag = value.trim().replace(/^#/, '')
    if (!nextTag || tags.includes(nextTag) || tags.length >= 5) {
      setValue('')
      return
    }

    onChange([...tags, nextTag])
    setValue('')
  }

  return (
    <div className="field">
      <span>タグ</span>
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
          placeholder="例: ラジオ"
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
          <small>最大5個まで。タップで削除できます。</small>
        )}
      </div>
    </div>
  )
}
