import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className="screen !p-0" style={{ background: 'var(--paper)' }}>
      <AddPassionForm onSubmit={handleSubmit} errorMessage={errorMessage} />
    </div>
  )
}
