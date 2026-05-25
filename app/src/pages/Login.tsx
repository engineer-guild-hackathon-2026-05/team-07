import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import type { User } from '../types/models'

const LOGIN_BG_VIDEO = '/mp_.mp4'

const FEATURES = ['偏愛を込める', 'キャラを育てる', '卵を交わす'] as const

type LoginPageProps = {
  authError: string
  isLoading: boolean
  onAnonymousLogin: () => void
  onDemoLogin: () => void
  onGoogleLogin: () => void
  user: User | null
}

type LoginVideoProps = {
  variant: 'hero' | 'ambient'
}

function LoginBackgroundVideo({ variant }: LoginVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (reduceMotion || failed) {
      return
    }

    const video = videoRef.current
    if (!video) {
      return
    }

    void video.play().catch(() => {
      // Keep gradient fallback when autoplay is blocked.
    })
  }, [failed, reduceMotion])

  const isHero = variant === 'hero'

  if (reduceMotion || failed) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 ${
          isHero
            ? 'bg-gradient-to-br from-[#FBF6EC] via-[#FFF8EF] to-[#F2E9D6]'
            : 'bg-[#FBF6EC]'
        }`}
        aria-hidden
      />
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out ${
          visible ? (isHero ? 'opacity-[0.42]' : 'opacity-[0.22]') : 'opacity-0'
        }`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setVisible(true)}
        onCanPlay={() => setVisible(true)}
        onError={() => setFailed(true)}
      >
        <source src={LOGIN_BG_VIDEO} type="video/mp4" />
      </video>
      <div
        className={
          isHero
            ? 'absolute inset-0 bg-gradient-to-br from-[#FBF6EC]/94 via-[#FFF8EF]/82 to-[#F2E9D6]/90'
            : 'absolute inset-0 bg-[#FBF6EC]/88'
        }
      />
    </div>
  )
}

function GoogleG({ size = 18 }: { size?: number }) {  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 7.9-21l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5A20 20 0 0 0 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.6l6.2 5.2C41 35.1 44 30 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  )
}

function LoginActions({
  authError,
  isLoading,
  onAnonymousLogin,
  onDemoLogin,
  onGoogleLogin,
}: Omit<LoginPageProps, 'user'>) {
  return (
    <div className="flex flex-col gap-2.5" aria-label="ログイン">
      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={isLoading}
        className="flex h-[54px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border border-[#E5E5E5] bg-[#FFFCF4] text-[15px] font-semibold text-[#494949] shadow-[0_1px_0_rgba(80,50,30,0.04),0_2px_6px_rgba(80,50,30,0.06)] transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleG size={18} />
        Googleでログイン
      </button>

      <button
        type="button"
        onClick={onAnonymousLogin}
        disabled={isLoading}
        className="h-12 w-full cursor-pointer rounded-full border border-[#E5E5E5] bg-[#FFFCF4] text-[14px] font-medium text-[#5C5C5C] shadow-[0_1px_0_rgba(80,50,30,0.04),0_2px_6px_rgba(80,50,30,0.06)] transition-all duration-150 hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        ゲストではじめる
      </button>

      <button
        type="button"
        onClick={onDemoLogin}
        disabled={isLoading}
        className="h-10 w-full cursor-pointer rounded-full bg-transparent text-[13px] font-medium text-[#8A8A8A] underline decoration-1 decoration-[#E5E5E5] underline-offset-4 transition-all duration-150 hover:text-[#5C5C5C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        デモとして見る
      </button>

      <p className="-mt-1 text-center text-[11px] leading-snug text-[#8A8A8A]">
        デモはFirebaseに接続せず、ログイン後UIだけ確認します。
      </p>

      {authError ? <p className="mt-1 text-center text-[12px] font-medium text-[#E77300]">{authError}</p> : null}
    </div>
  )
}

function LoginPanel({
  authError,
  isLoading,
  onAnonymousLogin,
  onDemoLogin,
  onGoogleLogin,
  compact = false,
}: Omit<LoginPageProps, 'user'> & { compact?: boolean }) {
  return (
    <div
      className={`grid w-full gap-5 ${
        compact
          ? ''
          : 'rounded-[28px] border border-[#E5E5E5] bg-[#FFFCF4] p-7 shadow-[0_1px_0_rgba(80,50,30,0.04),0_16px_36px_rgba(80,50,30,0.08)] lg:p-8'
      }`}
    >
      <div className={compact ? 'text-center' : 'text-left'}>
        {!compact ? (
          <p className="m-0 text-[12px] font-bold tracking-[0.16em] text-[#8A8A8A] uppercase">ログイン</p>
        ) : null}
        <h2 className={`m-0 font-black tracking-wide text-[#494949] ${compact ? 'text-[30px]' : 'mt-2 text-[34px]'}`}>          {compact ? 'Aicoにっち' : 'はじめまして'}
        </h2>
        <p className={`m-0 leading-relaxed text-[#5C5C5C] ${compact ? 'mt-2 text-[13px]' : 'mt-2 text-[15px]'}`}>
          {compact
            ? '好きを、キャラに。偏愛を、つなごう。'
            : '一緒に素敵な毎日をつくろう。アカウントでログインするか、ゲストで始められます。'}
        </p>
      </div>

      <LoginActions
        authError={authError}
        isLoading={isLoading}
        onAnonymousLogin={onAnonymousLogin}
        onDemoLogin={onDemoLogin}
        onGoogleLogin={onGoogleLogin}
      />
    </div>
  )
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

  const loginProps = {
    authError,
    isLoading,
    onAnonymousLogin,
    onDemoLogin,
    onGoogleLogin,
  }

  return (
    <div className="relative grid min-h-[100svh] w-full overflow-hidden bg-[#FBF6EC] font-sans lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      {/* Desktop hero panel */}
      <section className="relative hidden min-h-[100svh] overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <LoginBackgroundVideo variant="hero" />

        <div className="relative z-10 flex flex-1 flex-col justify-end p-12 xl:p-14">
          <div className="grid max-w-xl gap-5">            <div className="grid gap-3">
              <span className="inline-flex w-fit items-center rounded-full bg-[#FFE9D2] px-3 py-1 text-[12px] font-bold text-[#E77300]">
                おかえりなさい、はじめての方も
              </span>
              <h1 className="m-0 text-[clamp(2.5rem,4vw,3.5rem)] font-black leading-tight tracking-wide text-[#494949]">
                Aicoにっち
              </h1>
              <p className="m-0 max-w-md text-lg leading-relaxed text-[#5C5C5C]">
                好きを、キャラに。偏愛を、つなごう。
              </p>
              <p className="m-0 max-w-md text-sm leading-relaxed text-[#8A8A8A]">
                あなたの偏愛から生まれたキャラと出会い、育て、大切な人と交換しよう。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {FEATURES.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-[#E5E5E5] bg-[#FFFCF4]/88 px-3 py-1.5 text-[12px] font-bold text-[#494949] shadow-[0_1px_0_rgba(80,50,30,0.04)]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Login panel */}
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 py-10 lg:justify-center lg:px-10 lg:py-16 xl:px-14">
        <div className="absolute inset-0 lg:hidden">
          <LoginBackgroundVideo variant="ambient" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[440px] min-h-0 flex-1 flex-col lg:min-h-0 lg:justify-center">
          <div className="flex flex-1 flex-col justify-center lg:hidden">            <LoginPanel {...loginProps} compact />
          </div>

          <div className="hidden lg:block">
            <LoginPanel {...loginProps} />
          </div>
        </div>
      </section>
    </div>
  )
}
