import { Navigate } from 'react-router-dom'
import { Mascot } from '../features/components/Mascot'
import { Button } from '../features/components/ui'
import type { User } from '../types/models'

type LoginPageProps = {
  authError: string
  isLoading: boolean
  onAnonymousLogin: () => void
  onDemoLogin: () => void
  onGoogleLogin: () => void
  user: User | null
}

export function LoginPage({
  authError,
  isLoading,
  onAnonymousLogin,
  onDemoLogin,
  onGoogleLogin,
  user,
}: LoginPageProps) {
  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="grid place-items-center min-h-full px-7 py-[38px] bg-white">
      <section className="grid justify-items-center gap-7 w-full text-center">
        <p className="text-orange-dark text-xs font-extrabold uppercase tracking-wider">偏愛キャラクター育成アプリ</p>
        <h1 className="text-orange text-[32px] font-black tracking-widest">HenAi Egg</h1>
        <div
          className="relative flex justify-center items-end w-full min-h-[190px] my-5 mb-2.5 [&_.mascot]:mx-[-22px] [&_.mascot]:scale-[0.86] [&_.mascot]:drop-shadow-[0_18px_20px_rgba(255,155,55,0.16)] [&_.mascot:first-child]:scale-[0.72] [&_.mascot:first-child]:opacity-[0.82] [&_.mascot:last-child]:scale-[0.72] [&_.mascot:last-child]:opacity-[0.82]"
          aria-label="サービスのキャラクター"
        >
          <Mascot size="small" egg={{ color: '#d9c8ff' }} />
          <Mascot size="small" egg={{ color: '#ffb6d9' }} />
          <Mascot size="small" egg={{ color: '#ffe1a8' }} />
        </div>

        <div className="grid gap-2.5 w-full max-w-[280px] text-left">
          <span className="text-orange text-[13px] font-black">Google login</span>
          <button
            type="button"
            className="grid grid-cols-[42px_1fr] gap-2.5 items-center w-full min-h-[58px] border border-[#e5e5e5] rounded-lg px-3 py-2 bg-white text-text-h shadow-[0_3px_10px_rgba(73,73,73,0.1)] text-left cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            onClick={onGoogleLogin}
            disabled={isLoading}
          >
            <span className="grid place-items-center w-[34px] h-[34px] rounded-full text-[#4285f4] bg-[#f8f8f8] font-black">
              G
            </span>
            <span>
              <strong className="block leading-tight">Sign in with Google</strong>
              <small className="block leading-tight text-[#777]">ログイン状態とusers作成を確認</small>
            </span>
          </button>
          <Button type="button" variant="secondary" onClick={onAnonymousLogin} disabled={isLoading}>
            ゲストではじめる
          </Button>
          <Button type="button" variant="ghost" onClick={onDemoLogin} disabled={isLoading}>
            デモとして見る
          </Button>
          <small className="text-[#8d8d8d] text-xs leading-snug text-center">
            デモはFirebaseに接続せず、ログイン後UIだけ確認します。
          </small>
        </div>

        {authError ? (
          <p className="w-full rounded-2xl px-3.5 py-3 bg-cream-tab text-orange-dark text-[13px] font-extrabold text-left">
            {authError}
          </p>
        ) : null}
      </section>
    </div>
  )
}
