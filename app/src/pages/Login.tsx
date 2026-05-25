import { Navigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { CharacterIllustration } from '../features/components/CharacterIllustration'
import { charThree, charactersBg } from '../lib/characterAssets'
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
    <div className="login-screen">
      <div className="login-scene" aria-hidden>
        <img src={charactersBg} alt="" className="login-scene__bg" />
        <div className="login-scene__fade" />
      </div>

      <section className="login-card">
        <p className="eyebrow">偏愛キャラクター育成アプリ</p>
        <h1>HenAi Egg</h1>
        <div className="login-hero-art" aria-label="サービスのキャラクター">
          <img src={charThree} alt="" className="login-hero-art__group" />
          <div className="login-hero-art__cast">
            <CharacterIllustration egg={{ motif: 'cat', color: '#4EDBFB', id: 'login-blue', name: 'そら' }} size="small" />
            <CharacterIllustration egg={{ motif: 'fox', color: '#ffb6d9', id: 'login-pink', name: 'もも' }} size="small" />
            <CharacterIllustration egg={{ motif: 'bird', color: '#d9c8ff', id: 'login-purple', name: 'ゆめ' }} size="small" />
          </div>
        </div>

        <div className="login-actions">
          <span>Google login</span>
          <button type="button" className="google-login-button" onClick={onGoogleLogin} disabled={isLoading}>
            <span className="google-avatar">G</span>
            <span>
              <strong>Sign in with Google</strong>
              <small>ログイン状態とusers作成を確認</small>
            </span>
          </button>
          <Button type="button" variant="secondary" onClick={onAnonymousLogin} disabled={isLoading}>
            ゲストではじめる
          </Button>
          <Button type="button" variant="ghost" onClick={onDemoLogin} disabled={isLoading}>
            デモとして見る
          </Button>
          <small className="demo-login-note">デモはFirebaseに接続せず、ログイン後UIだけ確認します。</small>
        </div>

        {authError ? <p className="auth-error">{authError}</p> : null}
      </section>
    </div>
  )
}
