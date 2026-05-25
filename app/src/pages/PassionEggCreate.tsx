import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { createEggFromPassion } from '../lib/eggRepository'
import { appendEggToLocalData } from '../lib/localRepository'
import { buildLineShareUrl } from '../lib/exchangeShare'
import { buildReceiveUrlForExchange, callCreateUrlExchange } from '../firebase/exchange'
import type { AppData } from '../types/models'

type PassionEggCreatePageProps = {
  userId: string
  userName: string
  onDataChange: (nextData: AppData) => void
}

type CreatePhase = 'idle' | 'creating' | 'done' | 'error'
type SharePhase = 'idle' | 'issuing' | 'error'

export function PassionEggCreatePage({
  userId,
  userName,
  onDataChange,
}: PassionEggCreatePageProps) {
  const { passionId } = useParams()
  const [phase, setPhase] = useState<CreatePhase>('idle')
  const [eggId, setEggId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [sharePhase, setSharePhase] = useState<SharePhase>('idle')
  const [shareErrorMessage, setShareErrorMessage] = useState('')

  if (!userId) {
    return <Navigate to="/login" replace />
  }

  if (!passionId) {
    return <Navigate to="/passions/new" replace />
  }

  const isCreating = phase === 'creating'
  const isDone = phase === 'done'

  const pulseClass = useMemo(() => {
    if (phase === 'creating') {
      return 'animate-[egg-pulse_1.2s_ease-in-out_infinite]'
    }
    if (phase === 'done') {
      return 'animate-[egg-pop_420ms_ease-out_1]'
    }
    return ''
  }, [phase])

  const handleCreateEgg = async () => {
    if (isCreating || isDone) {
      return
    }

    setPhase('creating')
    setErrorMessage('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 1400))
      const createdEgg = await createEggFromPassion({ passionId, userId, userName })
      const nextData = appendEggToLocalData(createdEgg)
      onDataChange(nextData)
      setEggId(createdEgg.id)
      setPhase('done')
    } catch {
      setPhase('error')
      setErrorMessage('卵の作成に失敗しました。時間をおいて再試行してください。')
    }
  }

  const handleShareViaLine = async () => {
    if (!eggId || sharePhase === 'issuing') {
      return
    }

    setSharePhase('issuing')
    setShareErrorMessage('')

    try {
      const { exchangeId } = await callCreateUrlExchange(eggId)
      const receiveUrl = buildReceiveUrlForExchange(exchangeId)
      const shareText = `偏愛から生まれた卵を渡します🥚\n受け取る → ${receiveUrl}`
      const lineUrl = buildLineShareUrl(shareText)
      window.open(lineUrl, '_blank', 'noopener,noreferrer')
      setSharePhase('idle')
    } catch {
      setSharePhase('error')
      setShareErrorMessage('共有URLの発行に失敗しました。時間をおいて再試行してください。')
    }
  }

  return (
    <div className="screen !p-0 flex h-full flex-col bg-[#fffdfb]">
      <style>{`\n        @keyframes egg-pulse {\n          0%, 100% { transform: scale(1); }\n          50% { transform: scale(1.06); }\n        }\n        @keyframes egg-pop {\n          0% { transform: scale(0.92); }\n          70% { transform: scale(1.12); }\n          100% { transform: scale(1); }\n        }\n      `}</style>

      <header className="border-b border-[#f1e7dc] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#e77300]">char-04</p>
        <h1 className="text-lg font-extrabold text-[#1f1f1f]">卵を作成する</h1>
        <p className="mt-1 text-xs text-[#737373]">抽出した偏愛をもとに、あなたの卵を生成します。</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div
          className={`h-[170px] w-[140px] rounded-[52%_52%_46%_46%_/_62%_62%_38%_38%] bg-gradient-to-b from-[#fff8f0] to-[#ffd8ad] shadow-[0_16px_42px_rgba(255,155,55,0.28)] border border-[#f6cf9e] ${pulseClass}`}
          aria-hidden
        />

        {phase === 'idle' ? <p className="text-sm text-[#6b6b6b]">準備ができたら卵を作成してください。</p> : null}
        {phase === 'creating' ? <p className="text-sm font-semibold text-[#e77300]">偏愛エネルギーを注入中...</p> : null}
        {phase === 'done' ? (
          <div className="rounded-2xl bg-[#fff1df] px-4 py-3 text-center">
            <p className="text-sm font-bold text-[#c2410c]">卵ができました！</p>
            <p className="mt-1 text-xs text-[#6b6b6b]">eggId: {eggId}</p>
          </div>
        ) : null}
        {phase === 'error' ? <p className="text-xs font-semibold text-[#c2410c]">{errorMessage}</p> : null}
      </div>

      <div className="border-t border-[#f1e7dc] bg-white px-4 py-4">
        <button
          type="button"
          onClick={() => void handleCreateEgg()}
          disabled={isCreating || isDone}
          className="w-full rounded-2xl bg-[#ff9b37] px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
        >
          {isCreating ? '卵を生成中...' : isDone ? '生成完了' : '卵を作成する'}
        </button>

        {isDone ? (
          <>
            <button
              type="button"
              onClick={() => void handleShareViaLine()}
              disabled={sharePhase === 'issuing'}
              className="mt-3 w-full rounded-2xl bg-[#06c755] px-4 py-3 text-sm font-bold text-white disabled:opacity-70"
            >
              {sharePhase === 'issuing' ? '共有URLを発行中...' : 'LINEで共有'}
            </button>
            {sharePhase === 'error' ? (
              <p className="mt-2 text-xs font-semibold text-[#c2410c]">{shareErrorMessage}</p>
            ) : null}
          </>
        ) : null}

        <div className="mt-3 flex justify-end">
          <Link to="/" className="text-xs font-semibold text-[#e77300] underline-offset-2 hover:underline">
            ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
