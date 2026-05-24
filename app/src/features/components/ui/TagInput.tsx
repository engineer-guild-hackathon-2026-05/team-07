import { useState } from 'react'
import { Button } from './Button'

type TagInputProps = {
  tags: string[]
  onChange: (tags: string[]) => void
}

const inputClasses =
  'w-full box-border border-2 border-border rounded-md px-4 py-3.5 bg-cream-light text-text-h font-[inherit]'

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
    <div className="grid gap-3">
      <span className="text-text-h font-black">タグ</span>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <input
          className={inputClasses}
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
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <button
              type="button"
              key={tag}
              className="border-none rounded-full px-[11px] py-[7px] bg-tag-bg text-tag-text font-[inherit] text-[13px] font-extrabold cursor-pointer"
              onClick={() => onChange(tags.filter((currentTag) => currentTag !== tag))}
            >
              #{tag}
            </button>
          ))
        ) : (
          <small className="text-[#8d8d8d] text-xs">最大5個まで。タップで削除できます。</small>
        )}
      </div>
    </div>
  )
}
