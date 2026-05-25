import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button, TagInput, Textarea, TextField } from '../../components/ui'
import type { PassionInput, Visibility } from '../../types/models'

type AddPassionFormProps = {
  onSubmit: (input: PassionInput) => void | Promise<void>
  errorMessage?: string
}

const PANEL_FORM =
  'border border-[rgba(255,155,55,0.12)] rounded-lg bg-white shadow-soft p-5 grid gap-[18px] md:max-w-[640px]'

export function AddPassionForm({ onSubmit, errorMessage }: AddPassionFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
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
    setVisibility('public')
  }

  return (
    <form className={PANEL_FORM} onSubmit={handleSubmit}>
      <TextField
        label="タイトル"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="例: 小さな文房具を集めること"
        required
      />
      <Textarea
        label="自由記述"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="どこが好き？どんな専門用語に反応する？"
        rows={5}
        required
      />
      <TagInput tags={tags} onChange={setTags} />
      <label className="grid gap-3">
        <span className="text-text-heading font-black">公開範囲</span>
        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as Visibility)}
          className="w-full box-border border-2 border-[#f1e7dc] rounded-md px-4 py-3.5 bg-[#fffaf4] text-text-heading font-[inherit]"
        >
          <option value="public">公開</option>
          <option value="friends">交換した人だけ</option>
          <option value="private">非公開</option>
        </select>
      </label>
      <Button type="submit">AIチャットで深掘り</Button>
      {errorMessage ? <p className="text-xs font-semibold text-[#c2410c]">{errorMessage}</p> : null}
    </form>
  )
}
