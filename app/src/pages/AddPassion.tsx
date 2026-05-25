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

  const handleSubmit = async (input: PassionInput) => {
    const passionId = await submitPassion(input)
    if (!passionId) {
      return
    }
    navigate(`/passions/${passionId}/aichat`)
  }

  return (
    <div className="screen screen-form">
      <Card className="add-intro">
        <p className="eyebrow">char-01</p>
        <h1>偏愛をことばにする</h1>
        <p>好きなポイントを入力すると、ローカルの仮ロジックで卵とキャラを生成します。</p>
      </Card>

      <AddPassionForm onSubmit={handleSubmit} />
    </div>
  )
}
