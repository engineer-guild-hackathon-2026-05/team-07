import { Navigate } from 'react-router-dom'
import { Button, StackedActionButton } from '../components/ui'
import { CharacterIllustration } from '../features/components/CharacterIllustration'
import { charactersBg } from '../lib/characterAssets'
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
    <div className="login-screen">
      <div className="login-scene" aria-hidden>
        <img src={charactersBg} alt="" className="login-scene__bg" />
        <div className="login-scene__fade" />
      </div>

      <div className="login-layout">
        <section className="login-hero" aria-labelledby="login-heading">
          <div className="login-hero__main">
            <div className="login-hero__copy">
              <p className="eyebrow">偏愛キャラクター育成アプリ</p>
              <h1 id="login-heading">HenAi Egg</h1>
              <p className="login-tagline">好きを、キャラに。偏愛を、つなごう。</p>
            </div>

            <div className="login-actions" aria-label="ログイン">
              <StackedActionButton
                icon="G"
                title="Sign in with Google"
                description="アカウントを作成して、偏愛キャラ育成を始める"
                onClick={onGoogleLogin}
                disabled={isLoading}
              />
              <Button type="button" variant="secondary" onClick={onAnonymousLogin} disabled={isLoading}>
                ゲストではじめる
              </Button>
              <Button type="button" variant="ghost" onClick={onDemoLogin} disabled={isLoading}>
                デモとして見る
              </Button>
              <small className="demo-login-note">デモはFirebaseに接続せず、ログイン後UIだけ確認します。</small>
              {authError ? <p className="auth-error">{authError}</p> : null}
            </div>

            <p className="login-lead">
              「これが好き」をことばにして登録すると、あなただけの偏愛キャラが卵から生まれます。
              仲間と交換して、会話を重ねながら、好きの形に育てていきましょう。
            </p>
          </div>

          <div className="login-hero-art" aria-label="サービスのキャラクター">
            <img src={loginHeroGif} alt="" className="login-hero-art__group" />
            <div className="login-hero-art__cast">
              <CharacterIllustration egg={{ motif: 'cat', color: '#4EDBFB', id: 'login-blue', name: 'そら' }} size="small" />
              <CharacterIllustration egg={{ motif: 'fox', color: '#ffb6d9', id: 'login-pink', name: 'もも' }} size="small" />
              <CharacterIllustration egg={{ motif: 'bird', color: '#d9c8ff', id: 'login-purple', name: 'ゆめ' }} size="small" />
            </div>
          </div>
        </section>

        <section className="login-features" aria-labelledby="login-features-heading">
          <div className="login-features__intro">
            <p className="eyebrow">How it works</p>
            <h2 id="login-features-heading">HenAi Egg でできること</h2>
            <p className="login-features__lead">3つのステップで、あなたの「好き」がキャラクターになり、人とつながります。</p>
          </div>

          <div className="login-feature-grid">
            {LOGIN_FEATURES.map((feature) => (
              <article className="login-feature-card" key={feature.step}>
                <span className="login-feature-card__step">{feature.step}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
