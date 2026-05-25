import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui'
import { AddPassionForm, useAddPassion } from '../features/charcter_making'
import type { PassionInput } from '../types/models'

type AddPassionPageProps = {
  userId: string
}

export function AddPassionPage({ userId }: AddPassionPageProps) {
  const navigate = useNavigate()
  const { submitPassion } = useAddPassion(userId)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (input: PassionInput) => {
    setErrorMessage('')
    try {
      const passionId = await submitPassion(input)
      if (!passionId) {
        setErrorMessage('ログイン状態を確認してください。')
        return
      }
      navigate(`/passions/${passionId}/aichat`)
    } catch {
      setErrorMessage('保存に失敗しました。Firestoreルールとログイン状態を確認してください。')
    }
  }

  return (
    <div className="screen screen-form">
      <Card className="add-intro">
        <p className="eyebrow">char-01</p>
        <h1>偏愛をことばにする</h1>
        <p>好きなポイントを入力すると、ローカルの仮ロジックで卵とキャラを生成します。</p>
      </Card>

      <AddPassionForm onSubmit={handleSubmit} errorMessage={errorMessage} />
    </div>
  )
}
