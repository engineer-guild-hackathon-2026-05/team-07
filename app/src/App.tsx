import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { BottomNav } from './features/components/BottomNav'
import { Button } from './features/components/ui'
import { useAuth } from './firebase/auth'
import { getMyCharacters, getMyEggs, getMyPassions, loadAppData, resetDemoData } from './lib/localRepository'
import { AddPassionPage } from './pages/AddPassion'
import { CharacterDetailPage } from './pages/CharacterDetail'
import { DevStylePage } from './pages/DevStyle'
import { ExchangePage } from './pages/Exchange'
import { HomePage } from './pages/Home'
import { LoginPage } from './pages/Login'
import { ProfilePage } from './pages/Profile'
import type { AppData, User } from './types/models'

function LoadingScreen() {
  return (
    <main className="app-shell">
      <div className="phone-frame">
        <div className="login-screen">
          <section className="login-card">
            <p className="eyebrow">loading</p>
            <h1>準備中...</h1>
          </section>
        </div>
      </div>
    </main>
  )
}

function RequireAuth({ children, user }: { children: ReactNode; user: User | null }) {
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

function AppContent() {
  const navigate = useNavigate()
  const [data, setData] = useState<AppData>(loadAppData)
  const {
    error: authError,
    isLoading: isAuthActionLoading,
    isReady: isAuthReady,
    signInAnonymously,
    signInWithDemo,
    signInWithGoogle,
    signOut,
    user,
  } = useAuth()

  const currentUid = user?.uid ?? ''
  const passions = useMemo(() => (currentUid ? getMyPassions(data, currentUid) : []), [data, currentUid])
  const eggs = useMemo(() => (currentUid ? getMyEggs(data, currentUid) : []), [data, currentUid])
  const characters = useMemo(() => (currentUid ? getMyCharacters(data, currentUid) : []), [data, currentUid])
  const exchanges = useMemo(
    () => data.exchanges.filter((exchange) => exchange.fromUid === currentUid || exchange.toUid === currentUid),
    [data.exchanges, currentUid],
  )

  const resetLocalDemo = () => {
    setData(resetDemoData())
    navigate('/')
  }

  const handleCreated = (nextData: AppData) => {
    setData(nextData)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  if (!isAuthReady) {
    return <LoadingScreen />
  }

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <Routes>
          <Route
            path="/login"
            element={
              <LoginPage
                authError={authError}
                isLoading={isAuthActionLoading}
                onGoogleLogin={signInWithGoogle}
                onAnonymousLogin={signInAnonymously}
                onDemoLogin={signInWithDemo}
                user={user}
              />
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth user={user}>
                <HomePage
                  user={user!}
                  passions={passions}
                  eggs={eggs}
                  characters={characters}
                  exchanges={exchanges}
                  onReset={resetLocalDemo}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/passions/new"
            element={
              <RequireAuth user={user}>
                <AddPassionPage onCreated={handleCreated} userId={user?.uid ?? ''} />
              </RequireAuth>
            }
          />
          <Route
            path="/exchange/share"
            element={
              <RequireAuth user={user}>
                <ExchangePage eggs={eggs} exchanges={exchanges} />
              </RequireAuth>
            }
          />
          <Route
            path="/exchange/scan"
            element={
              <RequireAuth user={user}>
                <ExchangePage eggs={eggs} exchanges={exchanges} />
              </RequireAuth>
            }
          />
          <Route
            path="/characters"
            element={
              <RequireAuth user={user}>
                <CharacterDetailPage eggs={eggs} characters={characters} userId={user?.uid ?? ''} />
              </RequireAuth>
            }
          />
          <Route
            path="/characters/:characterId"
            element={
              <RequireAuth user={user}>
                <CharacterDetailPage eggs={eggs} characters={characters} userId={user?.uid ?? ''} />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth user={user}>
                <ProfilePage
                  user={user!}
                  passions={passions}
                  eggs={eggs}
                  characters={characters}
                  exchanges={exchanges}
                  onLogout={handleLogout}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/dev/style"
            element={
              <RequireAuth user={user}>
                <DevStylePage eggs={eggs} characters={characters} />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {user ? <BottomNav firstCharacterId={characters[0]?.id} /> : null}
      </div>
      <aside className="desktop-note">
        <p className="eyebrow">UI/UX Local MVP</p>
        <h2>課金なしで確認できる接続前UI</h2>
        <p>FirestoreやFunctionsへは接続せず、UIはlocalStorageで確認できます。</p>
        {user ? (
          <Button type="button" variant="secondary" onClick={() => navigate('/dev/style')}>
            Design Systemを見る
          </Button>
        ) : null}
      </aside>
    </main>
  )
}

function App() {
  return <AppContent />
}

export default App
