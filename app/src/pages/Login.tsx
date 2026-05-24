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
    <div className="login-screen">
      <section className="login-card">
        <p className="eyebrow">偏愛キャラクター育成アプリ</p>
        <h1>HenAi Egg</h1>
        <div className="login-mascots" aria-label="サービスのキャラクター">
          <Mascot size="small" egg={{ color: '#d9c8ff' }} />
          <Mascot size="small" egg={{ color: '#ffb6d9' }} />
          <Mascot size="small" egg={{ color: '#ffe1a8' }} />
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
