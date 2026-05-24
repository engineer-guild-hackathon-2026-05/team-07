import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, TagInput, TextField } from '../features/components/ui'
import { createPassion } from '../lib/localRepository'
import type { AppData, Visibility } from '../types/models'

const screenClasses =
  'h-full overflow-y-auto box-border px-[22px] pt-7 pb-28 flex flex-col gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

const selectClasses =
  'w-full box-border border-2 border-border rounded-md px-4 py-3.5 bg-cream-light text-text-h font-[inherit]'

type AddPassionPageProps = {
  onCreated: (data: AppData) => void
  userId: string
}

export function AddPassionPage({ onCreated, userId }: AddPassionPageProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Visibility>('public')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle || !trimmedDescription) {
      return
    }

    const nextData = createPassion(
      {
        title: trimmedTitle,
        description: trimmedDescription,
        tags,
        visibility,
      },
      userId,
    )

    onCreated(nextData)
    navigate('/')
  }

  return (
    <div className={screenClasses}>
      <Card>
        <p className="text-orange-dark text-xs font-extrabold uppercase tracking-wider">char-01</p>
        <h1 className="text-[30px] leading-[1.18] text-text-h">偏愛をことばにする</h1>
        <p className="text-text">好きなポイントを入力すると、ローカルの仮ロジックで卵とキャラを生成します。</p>
      </Card>

      <form className="border border-orange/12 rounded-lg bg-white shadow-soft p-5 grid gap-[18px]" onSubmit={handleSubmit}>
        <TextField
          label="タイトル"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例: 小さな文房具を集めること"
          required
        />
        <TextField
          label="自由記述"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="どこが好き？どんな専門用語に反応する？"
          rows={5}
          multiline
          required
        />
        <TagInput tags={tags} onChange={setTags} />
        <label className="grid gap-3">
          <span className="text-text-h font-black">公開範囲</span>
          <select
            className={selectClasses}
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as Visibility)}
          >
            <option value="public">公開</option>
            <option value="friends">交換した人だけ</option>
            <option value="private">非公開</option>
          </select>
        </label>
        <Button type="submit">たまごを生成する</Button>
      </form>
    </div>
  )
}
