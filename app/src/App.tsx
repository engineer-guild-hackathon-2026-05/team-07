import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { BottomNav } from './components/BottomNav'
import { Button } from './components/ui/Button'
import { TagInput } from './components/ui/TagInput'
import { TextField } from './components/ui/TextField'
import {
  createPassion,
  getCurrentUser,
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
}: {
  onCreated: (data: AppData) => void
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

    const nextData = createPassion({
      title: trimmedTitle,
      description: trimmedDescription,
      tags,
      visibility,
    })

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
}: {
  user: User
  passions: Passion[]
  eggs: Egg[]
  characters: Character[]
  exchanges: Exchange[]
}) {
  return (
    <div className="screen">
      <section className="panel profile-card">
        <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
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
        <Button type="button" variant="ghost">
          ログアウト
        </Button>
        <p>ローカルMVPでは見た目のみ。Firebase Auth接続時に実処理を入れます。</p>
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

  const user = useMemo(() => getCurrentUser(data), [data])
  const passions = useMemo(() => getMyPassions(data, user.uid), [data, user.uid])
  const eggs = useMemo(() => getMyEggs(data, user.uid), [data, user.uid])
  const characters = useMemo(() => getMyCharacters(data, user.uid), [data, user.uid])
  const exchanges = useMemo(
    () => data.exchanges.filter((exchange) => exchange.fromUid === user.uid || exchange.toUid === user.uid),
    [data.exchanges, user.uid],
  )

  const resetLocalDemo = () => {
    setData(resetDemoData())
    setActiveRoute('home')
  }

  const handleCreated = (nextData: AppData) => {
    setData(nextData)
    setActiveRoute('home')
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
    add: <AddPassionScreen onCreated={handleCreated} />,
    exchange: <ExchangeScreen eggs={eggs} exchanges={exchanges} />,
    grow: <GrowScreen eggs={eggs} characters={characters} />,
    profile: (
      <ProfileScreen
        user={user}
        passions={passions}
        eggs={eggs}
        characters={characters}
        exchanges={exchanges}
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
