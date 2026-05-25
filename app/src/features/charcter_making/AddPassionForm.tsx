import type { FormEvent } from 'react'
import { useState } from 'react'
import { Button, TagInput, Textarea, TextField } from '../../components/ui'
import type { PassionInput, Visibility } from '../../types/models'

type AddPassionFormProps = {
  onSubmit: (input: PassionInput) => void | Promise<void>
}

export function AddPassionForm({ onSubmit }: AddPassionFormProps) {
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
    <form className="panel form-panel" onSubmit={handleSubmit}>
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
      <label className="field">
        <span>公開範囲</span>
        <select value={visibility} onChange={(event) => setVisibility(event.target.value as Visibility)}>
          <option value="public">公開</option>
          <option value="friends">交換した人だけ</option>
          <option value="private">非公開</option>
        </select>
      </label>
      <Button type="submit">たまごを生成する</Button>
    </form>
  )
}
