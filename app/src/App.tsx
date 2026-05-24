import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import './App.css'
import { BottomNav } from './features/components/BottomNav'
import { Button } from './features/components/ui/Button'
import { TagInput } from './features/components/ui/TagInput'
import { TextField } from './features/components/ui/TextField'
import { auth, db } from './firebase/firebase'
import {
  createPassion,
  getMyCharacters,
  getMyEggs,
  getMyPassions,
  loadAppData,
  resetDemoData,
} from './lib/localRepository'
import type { AppData, AppRoute, Character, Egg, Exchange, Passion, User, Visibility } from './types/models'

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor
  }
}

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

const getEggForCharacter = (eggs: Egg[], character: Character) =>
  eggs.find((egg) => egg.id === character.eggId)

const toAppUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  name: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'guest user' : 'user'),
  iconUrl: firebaseUser.photoURL ?? undefined,
  createdAt: new Date().toISOString(),
  favoriteTags: [],
})

const demoUser: User = {
  uid: 'local-user-m-takahashi',
  name: 'm.takahashi',
  createdAt: new Date().toISOString(),
  favoriteTags: ['カフェ巡り', '深夜ラジオ', '文房具'],
}

const ensureUserDocument = async (firebaseUser: FirebaseUser) => {
  const userRef = doc(db, 'users', firebaseUser.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    await setDoc(
      userRef,
      {
        name: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'guest user' : 'user'),
        iconUrl: firebaseUser.photoURL ?? '',
      },
      { merge: true },
    )
    return
  }

  await setDoc(userRef, {
    name: firebaseUser.displayName ?? (firebaseUser.isAnonymous ? 'guest user' : 'user'),
    iconUrl: firebaseUser.photoURL ?? '',
    createdAt: serverTimestamp(),
    favoriteTags: [],
  })
}

function Mascot({ egg, size = 'large' }: { egg?: Egg; size?: 'large' | 'small' }) {
  return (
    <div className={`mascot mascot--${size}`} style={{ '--mascot-color': egg?.color } as CSSProperties}>
      <div className="mascot-ear mascot-ear--left" />
      <div className="mascot-ear mascot-ear--right" />
      <div className="mascot-body">
        <span className="mascot-eye mascot-eye--left" />
        <span className="mascot-eye mascot-eye--right" />
        <span className="mascot-mouth" />
      </div>
      <div className="mascot-tail" />
    </div>
  )
}

function EggArt({ egg, label }: { egg?: Egg; label?: string }) {
  return (
    <div className="egg-art" style={{ '--egg-color': egg?.color } as CSSProperties}>
      <span className="egg-art__shine" />
      <span className="egg-art__zigzag" />
      <strong>{label ?? egg?.name ?? 'たまご'}</strong>
    </div>
  )
}

function HeaderBar({ user, onReset }: { user: User; onReset: () => void }) {
  return (
    <header className="app-header">
      <div>
        <p>{user.name}さんの</p>
        <h1>偏愛の卵</h1>
      </div>
      <button type="button" className="icon-button" aria-label="通知">
        🔔
      </button>
      <button type="button" className="text-reset" onClick={onReset}>
        reset
      </button>
    </header>
  )
}

function LoginScreen({
  authError,
  isLoading,
  onGoogleLogin,
  onAnonymousLogin,
  onDemoLogin,
}: {
  authError: string
  isLoading: boolean
  onGoogleLogin: () => void
  onAnonymousLogin: () => void
  onDemoLogin: () => void
}) {
  return (
    <div className="login-screen">
      <section className="login-card">
        <p className="eyebrow">偏愛キャラクター育成アプリ</p>
        <h1>サービス名</h1>
        <div className="login-mascots" aria-label="サービスのキャラクター">
          <Mascot size="small" egg={{ color: '#d9c8ff' } as Egg} />
          <Mascot size="small" egg={{ color: '#ffb6d9' } as Egg} />
          <Mascot size="small" egg={{ color: '#ffe1a8' } as Egg} />
        </div>

        <div className="login-actions">
          <span>Google login</span>
          <button type="button" className="google-login-button" onClick={onGoogleLogin} disabled={isLoading}>
            <span className="google-avatar">G</span>
            <span>
              <strong>Sign in with Google</strong>
              <small>偏愛の卵を受け取る</small>
            </span>
          </button>
          <Button type="button" variant="secondary" onClick={onAnonymousLogin} disabled={isLoading}>
            ゲストではじめる
          </Button>
          <Button type="button" variant="ghost" onClick={onDemoLogin} disabled={isLoading}>
            デモとして見る
          </Button>
          <small className="demo-login-note">Firebaseに接続せず、ログイン後のUIだけ確認します。</small>
        </div>

        {authError ? <p className="auth-error">{authError}</p> : null}
      </section>
    </div>
  )
}

function HomeScreen({
  user,
  passions,
  eggs,
  characters,
  onNavigate,
  onReset,
}: {
  user: User
  passions: Passion[]
  eggs: Egg[]
  characters: Character[]
  onNavigate: (route: AppRoute) => void
  onReset: () => void
}) {
  const mainEgg = eggs[0]
  const mainCharacter = characters[0]

  return (
    <div className="screen">
      <HeaderBar user={user} onReset={onReset} />

      <section className="hero-phone-card">
        <Mascot egg={mainEgg} />
        <div className="hero-phone-copy">
          <p className="eyebrow">local demo</p>
          <h2>{mainCharacter?.name ?? 'まだ卵がありません'}</h2>
          <p>{mainCharacter?.personality ?? '偏愛を登録すると、ここにキャラクターが生まれます。'}</p>
        </div>
      </section>

      <section className="quick-actions">
        <Button type="button" onClick={() => onNavigate('add')}>
          たまごを受け取る
        </Button>
        <Button type="button" variant="secondary" onClick={() => onNavigate('grow')}>
          育成する
        </Button>
      </section>

      <section className="panel">
        <div className="section-title-row">
          <h2>最近の偏愛</h2>
          <span>{passions.length}件</span>
        </div>
        <div className="passion-stack">
          {passions.slice(0, 3).map((passion) => (
            <article className="passion-row" key={passion.id}>
              <div>
                <strong>{passion.title}</strong>
                <p>{passion.description}</p>
              </div>
              <span>{formatShortDate(passion.createdAt)}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function AddPassionScreen({
  onCreated,
  userId,
}: {
  onCreated: (data: AppData) => void
  userId: string
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Visibility>('public')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle || !trimmedDescription) {
      return
    }

    const nextData = createPassion(
      {
        title: trimmedTitle,
        description: trimmedDescription,
        tags,
        visibility,
      },
      userId,
    )

    setTitle('')
    setDescription('')
    setTags([])
    setVisibility('public')
    onCreated(nextData)
  }

  return (
    <div className="screen">
      <section className="panel add-intro">
        <p className="eyebrow">char-01</p>
        <h1>偏愛をことばにする</h1>
        <p>好きなポイントを入力すると、ローカルの仮ロジックで卵とキャラを生成します。</p>
      </section>

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <TextField
          label="タイトル"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例: 小さな文房具を集めること"
          required
        />
        <TextField
          label="自由記述"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="どこが好き？どんな専門用語に反応する？"
          rows={5}
          multiline
          required
        />
        <TagInput tags={tags} onChange={setTags} />
        <label className="field">
          <span>公開範囲</span>
          <select value={visibility} onChange={(event) => setVisibility(event.target.value as Visibility)}>
            <option value="public">公開</option>
            <option value="friends">交換した人だけ</option>
            <option value="private">非公開</option>
          </select>
        </label>
        <Button type="submit">たまごを生成する</Button>
      </form>
    </div>
  )
}

function ExchangeScreen({ eggs, exchanges }: { eggs: Egg[]; exchanges: Exchange[] }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<number | null>(null)
  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'starting' | 'scanning' | 'previewOnly' | 'unsupported' | 'error'
  >('idle')
  const [scanResult, setScanResult] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [selectedEggId, setSelectedEggId] = useState(eggs[0]?.id ?? '')

  const selectedEgg = eggs.find((egg) => egg.id === selectedEggId) ?? eggs[0]
  const shareCode = selectedEgg ? `henai://exchange/${selectedEgg.id}` : 'henai://exchange/no-egg'

  const stopCamera = () => {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraStatus('idle')
  }

  useEffect(() => stopCamera, [])

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unsupported')
      return
    }

    try {
      setCameraStatus('starting')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const BarcodeDetector = window.BarcodeDetector
      if (!BarcodeDetector) {
        setCameraStatus('previewOnly')
        return
      }

      const detector = new BarcodeDetector({ formats: ['qr_code'] })
      setCameraStatus('scanning')

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          return
        }

        const codes = await detector.detect(videoRef.current)
        const firstCode = codes[0]?.rawValue
        if (firstCode) {
          setScanResult(firstCode)
          stopCamera()
        }
      }, 500)
    } catch {
      setCameraStatus('error')
    }
  }

  const submitManualCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (manualCode.trim()) {
      setScanResult(manualCode.trim())
      setManualCode('')
    }
  }

  return (
    <div className="screen">
      <section className="panel exchange-hero">
        <p className="eyebrow">exch-01 / exch-02</p>
        <h1>卵を交換する</h1>
        <p>相手のQRを読む、自分のQRを見せる、どちらもこの画面で行います。</p>
      </section>

      <section className="exchange-duo">
        <div className="panel center-panel exchange-card">
          <div className="section-title-row">
            <h2>相手のQRを読む</h2>
            <span>{cameraStatus === 'scanning' ? '読み取り中' : 'scan'}</span>
          </div>
          <div className="camera-frame">
            <video ref={videoRef} muted playsInline aria-label="QR読み取りカメラ" />
            {cameraStatus !== 'scanning' && cameraStatus !== 'previewOnly' ? (
              <div className="camera-placeholder">
                <span>QR</span>
                <p>枠の中に相手のQRを合わせます</p>
              </div>
            ) : null}
            <i />
          </div>
          <div className="camera-actions">
            {cameraStatus === 'scanning' || cameraStatus === 'previewOnly' ? (
              <Button type="button" variant="secondary" onClick={stopCamera}>
                カメラを止める
              </Button>
            ) : (
              <Button type="button" onClick={startCamera}>
                カメラを起動
              </Button>
            )}
          </div>
          {cameraStatus === 'previewOnly' ? (
            <p className="status-message">
              カメラは使えますが、このブラウザはQR自動検出に未対応です。下の手入力で動線確認できます。
            </p>
          ) : null}
          {cameraStatus === 'unsupported' ? (
            <p className="status-message">
              このブラウザまたは表示URLではカメラを起動できません。HTTPS、localhost、ブラウザ権限を確認してください。
            </p>
          ) : null}
          {cameraStatus === 'error' ? (
            <p className="status-message">カメラを起動できませんでした。権限やHTTPS設定を確認してください。</p>
          ) : null}
          {scanResult ? (
            <div className="scan-result">
              <span>読み取り結果</span>
              <strong>{scanResult}</strong>
              <p>本番ではこの値を交換Functionへ渡して、卵の所有者を更新します。</p>
            </div>
          ) : null}
        </div>

        <div className="panel center-panel exchange-card">
          <div className="section-title-row">
            <h2>自分のQRを見せる</h2>
            <span>share</span>
          </div>
          <div className="own-qr-card" aria-label="自分の交換QR">
            <div className="qr-mock qr-mock--share">
              <span />
              <span />
              <span />
              <strong>QR</strong>
            </div>
            <div>
              <p>渡す卵</p>
              <strong>{selectedEgg?.name ?? '卵がありません'}</strong>
            </div>
          </div>
          <label className="field compact-field">
            <span>見せる卵を選ぶ</span>
            <select value={selectedEgg?.id ?? ''} onChange={(event) => setSelectedEggId(event.target.value)}>
              {eggs.map((egg) => (
                <option value={egg.id} key={egg.id}>
                  {egg.name} / 孵化 {egg.hatchLevel}%
                </option>
              ))}
            </select>
          </label>
          <div className="share-code">
            <span>交換コード</span>
            <strong>{shareCode}</strong>
          </div>
          <p className="status-message">本番ではこのコードを実QRにして、一時トークン付きで表示します。</p>
        </div>
      </section>

      <form className="panel manual-scan-form" onSubmit={submitManualCode}>
        <TextField
          label="読み取りコードを手入力"
          value={manualCode}
          onChange={(event) => setManualCode(event.target.value)}
          placeholder="例: egg-sample-radio"
        />
        <Button type="submit" variant="secondary">
          読み取り扱いにする
        </Button>
      </form>

      <div className="egg-scroll">
        {eggs.map((egg) => (
          <article className="mini-card" key={egg.id}>
            <EggArt egg={egg} />
            <div>
              <strong>{egg.name}</strong>
              <p>孵化 {egg.hatchLevel}%</p>
            </div>
          </article>
        ))}
      </div>

      <section className="panel">
        <h2>交換履歴</h2>
        <div className="passion-stack">
          {exchanges.map((exchange) => (
            <article className="passion-row" key={exchange.id}>
              <div>
                <strong>{exchange.meetingContext}</strong>
                <p>eggId: {exchange.eggId}</p>
              </div>
              <span>{formatShortDate(exchange.createdAt)}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function GrowScreen({ eggs, characters }: { eggs: Egg[]; characters: Character[] }) {
  const character = characters[0]
  const egg = character ? getEggForCharacter(eggs, character) : eggs[0]

  return (
    <div className="screen">
      <section className="panel center-panel grow-hero">
        <p className="eyebrow">grow-01</p>
        <Mascot egg={egg} />
        <h1>{character?.name ?? '育成中キャラ'}</h1>
        <p>{character?.personality ?? '偏愛登録から生まれたキャラを育てる画面です。'}</p>
      </section>

      <section className="panel">
        <h2>育成メーター</h2>
        <Meter label="成長度" value={(character?.growthLevel ?? 1) * 20} />
        <Meter label="愛情" value={character?.affinityScore ?? 30} />
        <Meter label="知識" value={(character?.knowledgeAreas.length ?? 1) * 22} />
      </section>

      <section className="panel chat-preview">
        <h2>チャットUIの骨組み</h2>
        <div className="bubble bubble--character">その専門用語、もっと聞きたい…！</div>
        <div className="bubble bubble--user">この偏愛は細部の違いが大事なんだ。</div>
      </section>
    </div>
  )
}

function ProfileScreen({
  user,
  passions,
  eggs,
  characters,
  exchanges,
  onLogout,
}: {
  user: User
  passions: Passion[]
  eggs: Egg[]
  characters: Character[]
  exchanges: Exchange[]
  onLogout: () => void
}) {
  return (
    <div className="screen">
      <section className="panel profile-card">
        {user.iconUrl ? (
          <img className="avatar avatar-image" src={user.iconUrl} alt={`${user.name}のアイコン`} />
        ) : (
          <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
        )}
        <h1>{user.name}</h1>
        <p>偏愛 {passions.length}件 / 卵 {eggs.length}個 / 育成キャラ {characters.length}体</p>
      </section>

      <section className="panel">
        <h2>好きタグ</h2>
        <div className="tag-list">
          {user.favoriteTags.map((tag) => (
            <span className="tag-chip tag-chip--static" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-title-row">
          <h2>交換履歴</h2>
          <span>{exchanges.length}件</span>
        </div>
        <div className="passion-stack">
          {exchanges.map((exchange) => (
            <article className="passion-row" key={exchange.id}>
              <div>
                <strong>{exchange.meetingContext}</strong>
                <p>{exchange.fromUid} から受け取り</p>
              </div>
              <span>{formatShortDate(exchange.createdAt)}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>偏愛一覧</h2>
        <div className="passion-stack">
          {passions.map((passion) => (
            <article className="passion-row" key={passion.id}>
              <div>
                <strong>{passion.title}</strong>
                <p>{passion.tags.map((tag) => `#${tag}`).join(' ') || '#タグなし'}</p>
              </div>
              <span>{passion.visibility}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel logout-panel">
        <Button type="button" variant="ghost" onClick={onLogout}>
          ログアウト
        </Button>
        <p>Firebase Authからログアウトします。</p>
      </section>
    </div>
  )
}

function Meter({ label, value }: { label: string; value: number }) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div className="meter-row">
      <div>
        <span>{label}</span>
        <strong>{normalizedValue}%</strong>
      </div>
      <div className="meter-track">
        <span style={{ width: `${normalizedValue}%` }} />
      </div>
    </div>
  )
}

function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>('home')
  const [data, setData] = useState<AppData>(loadAppData)
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null)
  const [localDemoUser, setLocalDemoUser] = useState<User | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setAuthError('')
      setAuthUser(firebaseUser)
      setIsAuthReady(true)

      if (firebaseUser) {
        try {
          await ensureUserDocument(firebaseUser)
        } catch {
          setAuthError('ユーザー情報の保存に失敗しました。Firestoreルールを確認してください。')
        }
      }
    })

    return unsubscribe
  }, [])

  const user = useMemo(() => (authUser ? toAppUser(authUser) : localDemoUser), [authUser, localDemoUser])
  const currentUid = user?.uid ?? ''
  const passions = useMemo(() => (currentUid ? getMyPassions(data, currentUid) : []), [data, currentUid])
  const eggs = useMemo(() => (currentUid ? getMyEggs(data, currentUid) : []), [data, currentUid])
  const characters = useMemo(() => (currentUid ? getMyCharacters(data, currentUid) : []), [data, currentUid])
  const exchanges = useMemo(
    () => data.exchanges.filter((exchange) => exchange.fromUid === currentUid || exchange.toUid === currentUid),
    [data.exchanges, currentUid],
  )

  const handleGoogleLogin = async () => {
    try {
      setIsAuthActionLoading(true)
      setAuthError('')
      setLocalDemoUser(null)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      await ensureUserDocument(result.user)
    } catch {
      setAuthError('Googleログインに失敗しました。Firebase AuthのGoogle provider設定を確認してください。')
    } finally {
      setIsAuthActionLoading(false)
    }
  }

  const handleAnonymousLogin = async () => {
    try {
      setIsAuthActionLoading(true)
      setAuthError('')
      setLocalDemoUser(null)
      const result = await signInAnonymously(auth)
      await ensureUserDocument(result.user)
    } catch {
      setAuthError('ゲストログインに失敗しました。Firebase Authの匿名ログイン設定を確認してください。')
    } finally {
      setIsAuthActionLoading(false)
    }
  }

  const handleLogout = async () => {
    if (auth.currentUser) {
      await signOut(auth)
    }
    setLocalDemoUser(null)
    setActiveRoute('home')
  }

  const handleDemoLogin = () => {
    setAuthError('')
    setLocalDemoUser(demoUser)
    setActiveRoute('home')
  }

  const resetLocalDemo = () => {
    setData(resetDemoData())
    setActiveRoute('home')
  }

  const handleCreated = (nextData: AppData) => {
    setData(nextData)
    setActiveRoute('home')
  }

  if (!isAuthReady) {
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

  if (!user) {
    return (
      <main className="app-shell">
        <div className="phone-frame">
          <LoginScreen
            authError={authError}
            isLoading={isAuthActionLoading}
            onGoogleLogin={handleGoogleLogin}
            onAnonymousLogin={handleAnonymousLogin}
            onDemoLogin={handleDemoLogin}
          />
        </div>
        <aside className="desktop-note">
          <p className="eyebrow">ux-01</p>
          <h2>Firebase Authログイン</h2>
          <p>Google/ゲストログインはFirebase接続、デモはローカルだけでログイン後UIを確認できます。</p>
        </aside>
      </main>
    )
  }

  const screen = {
    home: (
      <HomeScreen
        user={user}
        passions={passions}
        eggs={eggs}
        characters={characters}
        onNavigate={setActiveRoute}
        onReset={resetLocalDemo}
      />
    ),
    add: <AddPassionScreen onCreated={handleCreated} userId={user.uid} />,
    exchange: <ExchangeScreen eggs={eggs} exchanges={exchanges} />,
    grow: <GrowScreen eggs={eggs} characters={characters} />,
    profile: (
      <ProfileScreen
        user={user}
        passions={passions}
        eggs={eggs}
        characters={characters}
        exchanges={exchanges}
        onLogout={handleLogout}
      />
    ),
  }[activeRoute]

  return (
    <main className="app-shell">
      <div className="phone-frame">
        {screen}
        <BottomNav activeRoute={activeRoute} onNavigate={setActiveRoute} />
      </div>
      <aside className="desktop-note">
        <p className="eyebrow">UI/UX Local MVP</p>
        <h2>課金なしで確認できる接続前UI</h2>
        <p>
          この画面はlocalStorageのみで動作します。FirestoreやFunctionsへは
          `localRepository` の中身を差し替えて接続します。
        </p>
      </aside>
    </main>
  )
}

export default App
