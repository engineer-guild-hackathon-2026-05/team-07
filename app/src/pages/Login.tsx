import { Navigate } from 'react-router-dom'
import loginHeroGif from '../assets/login-hero.gif'
import type { User } from '../types/models'

const LOGIN_FEATURES = [
  {
    step: '01',
    title: '偏愛を登録する',
    description: '好きなもの・こだわりを自由に書き込み。AIとの対話で、あなたらしい「偏愛」を言葉にしていきます。',
  },
  {
    step: '02',
    title: '卵からキャラが生まれる',
    description: '登録した偏愛から、世界にひとつだけのキャラクター（卵）が誕生。好きが形になって現れます。',
  },
  {
    step: '03',
    title: '交換して育てる',
    description: 'QRやURLで卵を渡し合い、チャットで会話を重ねながら親密度を上げ、キャラを成長させましょう。',
  },
] as const

type LoginPageProps = {
  authError: string
  isLoading: boolean
  onAnonymousLogin: () => void
  onDemoLogin: () => void
  onGoogleLogin: () => void
  user: User | null
}

function Sparkle({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
        fill="currentColor"
        opacity="0.75"
      />
    </svg>
  )
}

function StarBadge() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,_#FBE3B8_0%,_#F3B85F_100%)] shadow-[0_6px_16px_rgba(243,184,95,0.4)]">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#FFFCF4" aria-hidden>
        <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" />
      </svg>
    </div>
  )
}

function GoogleG({ size = 18 }: { size?: number }) {
  return (
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
    <div className="relative flex w-full min-h-[100svh] flex-col overflow-hidden bg-gradient-to-b from-[#FFF8EF] to-[#FBF6EC] px-7 pt-14 pb-8">
      {/* decorative sparkles */}
      <Sparkle className="absolute top-[70px] left-7 text-[#F3B85F]" size={18} />
      <Sparkle className="absolute top-[130px] right-9 text-[#F3B85F]" size={14} />
      <Sparkle className="absolute top-[280px] left-8 text-[#F8B7A8]" size={12} />
      <Sparkle className="absolute top-[240px] right-8 text-[#CDB6E2]" size={16} />

      {/* Hero */}
      <div className="text-center mt-4">
        <StarBadge />
        <h1 className="mt-3.5 text-[30px] font-black tracking-wider text-[#494949]">HenAi Egg</h1>
        <p className="mt-2 text-[12px] tracking-[0.16em] font-bold text-[#8A8A8A] uppercase">
          偏愛キャラクター育成アプリ
        </p>
        <p className="mt-2 text-[13px] tracking-wide text-[#5C5C5C]">
          好きを、キャラに。偏愛を、つなごう。
        </p>
      </div>

      {/* Hero illustration */}
      <div className="flex flex-1 items-center justify-center min-h-[260px] py-4">
        <img src={loginHeroGif} alt="" className="w-[300px] max-w-full h-auto" />
      </div>

      {/* Greeting */}
      <p className="mb-4 text-center text-[13px] leading-relaxed text-[#5C5C5C]">
        はじめまして！
        <br />
        一緒に素敵な毎日をつくろう。
      </p>

      {/* Sign-in buttons */}
      <div className="flex flex-col gap-2.5" aria-label="ログイン">
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="w-full h-[54px] rounded-full bg-[#FFFCF4] border border-[#E8DEC5] text-[#494949] font-semibold text-[15px] flex items-center justify-center gap-2.5 shadow-[0_6px_18px_rgba(80,50,30,0.10)] active:scale-[0.98] active:shadow-[0_1px_0_rgba(80,50,30,0.10)_inset] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <GoogleG size={18} />
          Googleでログイン
        </button>

        <button
          type="button"
          onClick={onAnonymousLogin}
          disabled={isLoading}
          className="w-full h-12 rounded-full bg-transparent border border-[#E8DEC5] text-[#5C5C5C] font-medium text-[14px] active:scale-[0.98] hover:bg-white/40 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          ゲストではじめる
        </button>

        <button
          type="button"
          onClick={onDemoLogin}
          disabled={isLoading}
          className="w-full h-10 rounded-full bg-transparent text-[#8A8A8A] font-medium text-[13px] underline underline-offset-4 decoration-1 decoration-[#CFC3A5] hover:text-[#5C5C5C] active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          デモとして見る
        </button>

        <p className="text-center text-[11px] text-[#8A8A8A] -mt-1 leading-snug">
          デモはFirebaseに接続せず、ログイン後UIだけ確認します。
        </p>

        {authError ? (
          <p className="text-center text-[12px] font-medium text-[#E77300] mt-1">{authError}</p>
        ) : null}
      </div>

      {/* How it works */}
      <section className="mt-8" aria-labelledby="login-features-heading">
        <h2
          id="login-features-heading"
          className="text-center text-[11px] font-bold tracking-[0.16em] text-[#8A8A8A] uppercase mb-3"
        >
          How it works
        </h2>
        <ul className="flex flex-col gap-2.5">
          {LOGIN_FEATURES.map((feature) => (
            <li
              key={feature.step}
              className="bg-[#FFFCF4] border border-[#E5E5E5] rounded-2xl px-4 py-3 flex gap-3 shadow-[0_1px_0_rgba(80,50,30,0.04),0_2px_6px_rgba(80,50,30,0.06)]"
            >
              <span className="shrink-0 w-8 h-8 rounded-full bg-[#FFE9D2] text-[#E77300] text-[11px] font-bold flex items-center justify-center">
                {feature.step}
              </span>
              <div>
                <h3 className="text-[13px] font-bold text-[#494949]">{feature.title}</h3>
                <p className="text-[11px] text-[#5C5C5C] mt-1 leading-relaxed">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
