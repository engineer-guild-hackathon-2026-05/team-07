import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { callCompleteExchange } from '../firebase/exchange'

type Phase = 'submitting' | 'success' | 'error'

type Props = {
  isAuthenticated: boolean
  onEggReceived?: (eggId: string) => Promise<void>
}

const errorMessageFromCode = (code: string): string => {
  switch (code) {
    case 'functions/unauthenticated':
      return 'ログインしてからリンクを開き直してください。'
    case 'functions/not-found':
      return 'この交換リンクは存在しません。'
    case 'functions/failed-precondition':
      return 'この卵はすでに他の人に受け取られています。'
    case 'functions/deadline-exceeded':
      return 'この交換リンクは期限切れです（24時間で失効します）。'
    case 'functions/permission-denied':
      return '自分が共有した卵は受け取れません。'
    default:
      return '受け取りに失敗しました。時間を置いてもう一度お試しください。'
  }
}

export function ExchangeReceiveByIdPage({ isAuthenticated, onEggReceived }: Props) {
  const { exchangeId = '' } = useParams<{ exchangeId: string }>()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('submitting')
  const [message, setMessage] = useState('受け取り処理中...')

  useEffect(() => {
    if (!isAuthenticated) {
      setPhase('error')
      setMessage('ログインしてからリンクを開き直してください。')
      return
    }

    if (!exchangeId) {
      setPhase('error')
      setMessage('exchangeId が指定されていません。')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const result = await callCompleteExchange(exchangeId)
        if (cancelled) return
        await onEggReceived?.(result.eggId)
        if (cancelled) return
        setPhase('success')
        setMessage('受け取り完了！育成画面に移動します...')
        navigate(`/characters/${result.characterId}`, { replace: true })
      } catch (error: unknown) {
        if (cancelled) return
        const code = (error as { code?: string })?.code ?? ''
        setPhase('error')
        setMessage(errorMessageFromCode(code))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [exchangeId, isAuthenticated, navigate, onEggReceived])

  return (
    <div className="screen exchange-screen">
      <Card className="exchange-hero">
        <p className="eyebrow">exchange / receive</p>
        <h1>卵を受け取る</h1>
        <p>{message}</p>
        {phase === 'error' ? (
          <Button type="button" onClick={() => navigate('/')}>
            ホームへ
          </Button>
        ) : null}
      </Card>
    </div>
  )
}
