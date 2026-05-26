import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from './features/components/BottomNav'
import { demoUser, useAuth } from './firebase/auth'
import { fetchMyCharactersFromFirestore } from './lib/characterRepository'
import { fetchEggFromFirestore, fetchMyEggsFromFirestore } from './lib/eggRepository'
import {
  CURRENT_USER_ID,
  getMyCharacters,
  getMyEggs,
  getMyNurturingCharacters,
  getMyNurturingEggs,
  getMyPassions,
  getMyUnassignedEggs,
  loadAppData,
  receiveEggForNurturing,
  resetDemoData,
  syncFirestoreGrowthToLocalData,
} from './lib/localRepository'
import { AddPassionPage } from './pages/AddPassion'
import { CharacterDetailPage } from './pages/CharacterDetail'
import { DevStylePage } from './pages/DevStyle'
import { ExchangePage } from './pages/Exchange'
import { ExchangeReceiveByIdPage } from './pages/ExchangeReceiveById'
import { ExchangeWaitPage } from './pages/ExchangeWait'
import { LoginPage } from './pages/Login'
import { PassionAiChatPage } from './pages/PassionAiChat'
import { PassionEggCreatePage } from './pages/PassionEggCreate'
import { ReceiveEggSetupPage } from './pages/ReceiveEggSetup'
import { ProfilePage } from './pages/Profile'
import type { AppData, User } from './types/models'

function LoadingScreen() {
  return (
    <main className="min-h-svh text-left">
      <div className="relative min-h-svh overflow-hidden bg-surface">
        <div className="relative min-h-svh bg-white">
          <section className="relative z-[1] grid justify-items-center gap-4 w-full px-7 py-12 text-center">
            <p className="m-0 text-primary-strong text-xs font-extrabold tracking-widest uppercase">loading</p>
            <h1 className="text-primary font-black tracking-wider text-3xl">準備中...</h1>
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
  const nurturingEggs = useMemo(
    () => (currentUid ? getMyNurturingEggs(data, currentUid) : []),
    [data, currentUid],
  )
  const unassignedEggs = useMemo(
    () => (currentUid ? getMyUnassignedEggs(data, currentUid) : []),
    [data, currentUid],
  )
  const characters = useMemo(() => (currentUid ? getMyCharacters(data, currentUid) : []), [data, currentUid])
  const nurturingCharacters = useMemo(
    () => (currentUid ? getMyNurturingCharacters(data, currentUid) : []),
    [data, currentUid],
  )

  useEffect(() => {
    if (!user?.uid) {
      return
    }

    if (user.uid === CURRENT_USER_ID || user.uid === demoUser.uid) {
      setData(resetDemoData())
      return
    }

    let cancelled = false
    Promise.all([fetchMyEggsFromFirestore(user.uid), fetchMyCharactersFromFirestore(user.uid)])
      .then(([firestoreEggs, firestoreCharacters]) => {
        if (cancelled) {
          return
        }
        if (firestoreEggs.length === 0 && firestoreCharacters.length === 0) {
          return
        }
        setData(syncFirestoreGrowthToLocalData(firestoreEggs, firestoreCharacters))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [user?.uid])

  const handleEggReceived = async (eggId: string) => {
    const egg = await fetchEggFromFirestore(eggId)
    if (egg && user?.uid) {
      setData((prev) => receiveEggForNurturing(prev, user.uid, egg))
    }
  }
  const exchanges = useMemo(
    () => data.exchanges.filter((exchange) => exchange.fromUid === currentUid || exchange.toUid === currentUid),
    [data.exchanges, currentUid],
  )

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  if (!isAuthReady) {
    return <LoadingScreen />
  }

  const shellClass = user
    ? 'min-h-svh text-left md:grid md:grid-cols-[240px_minmax(0,1fr)]'
    : 'min-h-auto text-left overflow-visible'
  const frameClass = user
    ? 'relative min-h-svh overflow-hidden bg-surface md:min-h-svh md:overflow-hidden'
    : 'relative min-h-auto h-auto overflow-visible bg-surface'

  return (
    <main className={shellClass}>
      {user ? <BottomNav firstCharacterId={nurturingCharacters[0]?.id ?? nurturingEggs[0]?.id} /> : null}
      <div className={frameClass}>
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
            element={<Navigate to="/characters" replace />}
          />
          <Route
            path="/passions/new"
            element={
              <RequireAuth user={user}>
                <AddPassionPage userId={user?.uid ?? ''} />
              </RequireAuth>
            }
          />
          <Route
            path="/passions/:passionId/aichat"
            element={
              <RequireAuth user={user}>
                <PassionAiChatPage userId={user?.uid ?? ''} />
              </RequireAuth>
            }
          />
          <Route
            path="/passions/:passionId/egg-create"
            element={
              <RequireAuth user={user}>
                <PassionEggCreatePage
                  userId={user?.uid ?? ''}
                  userName={user?.name ?? 'guest'}
                  onDataChange={setData}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/exchange/share"
            element={
              <RequireAuth user={user}>
                <ExchangePage
                  allEggs={data.eggs}
                  allPassions={data.passions}
                  characters={data.characters}
                  eggs={eggs}
                  exchanges={exchanges}
                  onDataChange={setData}
                  userId={currentUid}
                  userName={user?.name ?? 'guest'}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/exchange/scan"
            element={
              <RequireAuth user={user}>
                <ExchangePage
                  allEggs={data.eggs}
                  allPassions={data.passions}
                  characters={data.characters}
                  eggs={eggs}
                  exchanges={exchanges}
                  onDataChange={setData}
                  userId={currentUid}
                  userName={user?.name ?? 'guest'}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/exchange/receive"
            element={
              <RequireAuth user={user}>
                <ExchangePage
                  allEggs={data.eggs}
                  allPassions={data.passions}
                  characters={data.characters}
                  eggs={eggs}
                  exchanges={exchanges}
                  onDataChange={setData}
                  userId={currentUid}
                  userName={user?.name ?? 'guest'}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/exchange/wait/:exchangeId"
            element={
              <RequireAuth user={user}>
                <ExchangeWaitPage />
              </RequireAuth>
            }
          />
          <Route
            path="/exchange/receive/:exchangeId"
            element={
              <RequireAuth user={user}>
                <ExchangeReceiveByIdPage
                  isAuthenticated={Boolean(user)}
                  onEggReceived={handleEggReceived}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/characters/receive"
            element={
              <RequireAuth user={user}>
                <ReceiveEggSetupPage
                  data={data}
                  unassignedEggs={unassignedEggs}
                  userId={currentUid}
                  onDataChange={setData}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/characters"
            element={
              <RequireAuth user={user}>
                <CharacterDetailPage
                  eggs={nurturingEggs}
                  characters={nurturingCharacters}
                  userId={user?.uid ?? ''}
                  user={user!}
                  onDataChange={setData}
                  onLogout={handleLogout}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/characters/:characterId"
            element={
              <RequireAuth user={user}>
                <CharacterDetailPage
                  eggs={nurturingEggs}
                  characters={nurturingCharacters}
                  userId={user?.uid ?? ''}
                  user={user!}
                  onDataChange={setData}
                  onLogout={handleLogout}
                />
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
                  characters={nurturingCharacters}
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
      </div>
    </main>
  )
}

function App() {
  return <AppContent />
}

export default App
