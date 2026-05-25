import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import {
  buildLineShareUrl,
  copyShareText,
} from '../lib/exchangeShare'
import {
  buildReceiveUrlForExchange,
  listenExchange,
} from '../firebase/exchange'

type Status = 'waiting' | 'completed' | 'error'

export function ExchangeWaitPage() {
  const { exchangeId = '' } = useParams<{ exchangeId: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('waiting')
  const [errorMessage, setErrorMessage] = useState('')
  const [copyStatus, setCopyStatus] = useState('')

  const receiveUrl = exchangeId ? buildReceiveUrlForExchange(exchangeId) : ''
  const shareText = `偏愛から生まれた卵を渡します🥚\n受け取る → ${receiveUrl}`
  const lineUrl = buildLineShareUrl(shareText)

  useEffect(() => {
    if (!exchangeId) {
      setStatus('error')
      setErrorMessage('exchangeId が指定されていません')
      return
    }

    const unsubscribe = listenExchange(
      exchangeId,
      (data) => {
        if (!data) {
          return
        }
        if (data.status === 'completed') {
          setStatus('completed')
          navigate(`/characters/${data.eggId}`, { replace: true })
        }
      },
      (error) => {
        setStatus('error')
        setErrorMessage(error.message)
      },
    )
    return unsubscribe
  }, [exchangeId, navigate])

  useEffect(() => {
    if (!copyStatus) {
      return
    }
    const timer = window.setTimeout(() => setCopyStatus(''), 2400)
    return () => window.clearTimeout(timer)
  }, [copyStatus])

  const handleCopy = async () => {
    try {
      await copyShareText(receiveUrl)
      setCopyStatus('リンクをコピーしました')
    } catch {
      setCopyStatus('コピーに失敗しました')
    }
  }

  const handleLine = () => {
    window.open(lineUrl, '_blank', 'noopener,noreferrer')
  }

  if (status === 'error') {
    return (
      <div className="screen exchange-screen">
        <Card className="exchange-hero">
          <p className="eyebrow">exchange / error</p>
          <h1>エラー</h1>
          <p>{errorMessage}</p>
          <Button type="button" onClick={() => navigate('/')}>ホームへ</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="screen exchange-screen">
      <Card className="exchange-hero">
        <p className="eyebrow">exchange / waiting</p>
        <h1>交換相手の受け取りを待っています</h1>
        <p>
          下のリンクを LINE などで相手に送ってください。
          相手が受け取ると、自動で育成画面に移動します。
        </p>
      </Card>

      <Card>
        <div className="section-title-row">
          <h2>共有リンク</h2>
          <span>{copyStatus || (status === 'completed' ? 'completed' : 'pending')}</span>
        </div>
        <p className="share-code">
          <strong style={{ wordBreak: 'break-all' }}>{receiveUrl}</strong>
        </p>
        <div className="share-action-grid">
          <button
            type="button"
            className="share-action-button share-action-button--line"
            onClick={handleLine}
          >
            <span className="share-action-button__icon">L</span>
            <span>
              <strong>LINEで送る</strong>
              <small>リンク付きメッセージを開きます</small>
            </span>
          </button>
          <Button type="button" variant="secondary" onClick={handleCopy}>
            リンクをコピー
          </Button>
        </div>
      </Card>

      <Card>
        <p className="status-message">
          受け取りリンクは <strong>1回使い切り</strong>、発行から <strong>24時間</strong>で失効します。
        </p>
        {status === 'waiting' ? (
          <p className="status-message">相手の受け取りを待機中...</p>
        ) : null}
        {status === 'completed' ? (
          <p className="status-message">受け取り完了！育成画面に移動します...</p>
        ) : null}
      </Card>
    </div>
  )
}
