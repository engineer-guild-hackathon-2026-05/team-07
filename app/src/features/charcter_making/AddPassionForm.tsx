import type { FormEvent } from 'react'
import { useState } from 'react'
import type { PassionInput, Visibility } from '../../types/models'

type AddPassionFormProps = {
  onSubmit: (input: PassionInput) => void | Promise<void>
}

export function AddPassionForm({ onSubmit }: AddPassionFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('public')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    if (!trimmedTitle || !trimmedDescription) {
      return
    }

    await onSubmit({
      title: trimmedTitle,
      description: trimmedDescription,
      tags,
      visibility,
    })

    setTitle('')
    setDescription('')
    setTags([])
    setTagInput('')
    setVisibility('public')
  }

  const addTag = () => {
    const nextTag = tagInput.trim().replace(/^#/, '')
    if (!nextTag || tags.includes(nextTag) || tags.length >= 5) {
      setTagInput('')
      return
    }
    setTags((currentTags) => [...currentTags, nextTag])
    setTagInput('')
  }

  return (
    <form
      className="rounded-[28px] bg-[#fffdfb] p-5 shadow-[0_18px_44px_rgba(73,73,73,0.1)] space-y-4"
      onSubmit={handleSubmit}
    >
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#494949]">タイトル</span>
        <input
          className="w-full rounded-2xl border border-[#f1e7dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff9b37] focus:ring-2 focus:ring-[#ff9b37]/25"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例: 小さな文房具を集めること"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#494949]">自由記述</span>
        <textarea
          className="w-full resize-y rounded-2xl border border-[#f1e7dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff9b37] focus:ring-2 focus:ring-[#ff9b37]/25"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="どこが好き？どんな専門用語に反応する？"
          rows={5}
          required
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-semibold text-[#494949]">タグ</span>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-[#f1e7dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff9b37] focus:ring-2 focus:ring-[#ff9b37]/25"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTag()
              }
            }}
            placeholder="例: ラジオ"
          />
          <button
            type="button"
            className="rounded-2xl border border-[#f1e7dc] bg-white px-4 py-3 text-sm font-semibold text-[#494949] transition hover:bg-[#fff1df]"
            onClick={addTag}
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <button
                type="button"
                key={tag}
                className="rounded-full bg-[#fff1df] px-3 py-1 text-xs font-semibold text-[#494949]"
                onClick={() => setTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag))}
              >
                #{tag}
              </button>
            ))
          ) : (
            <small className="text-xs text-[#8d8d8d]">最大5個まで。タップで削除できます。</small>
          )}
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-[#494949]">公開範囲</span>
        <select
          className="w-full rounded-2xl border border-[#f1e7dc] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff9b37] focus:ring-2 focus:ring-[#ff9b37]/25"
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as Visibility)}
        >
          <option value="public">公開</option>
          <option value="friends">交換した人だけ</option>
          <option value="private">非公開</option>
        </select>
      </label>

      <button
        type="submit"
        className="w-full rounded-2xl bg-[#ff9b37] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e77300]"
      >
        たまごを生成する
      </button>
    </form>
  )
}
