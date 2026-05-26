import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { Button, Card, StackedActionButton, TextField, Textarea } from '../components/ui'
import { ExchangePreviewCard } from '../features/components/ExchangePreviewCard'
import { ExchangeQrCode } from '../features/components/ExchangeQrCode'
import { EggArt } from '../features/components/EggArt'
import { auth, db } from '../firebase/firebase'
import {
  buildLineShareUrl,
  buildReceiveUrl,
  buildShareText,
  copyShareText,
  parseExchangeScanResult,
  shareViaNativeSheet,
} from '../lib/exchangeShare'
import { formatShortDate, getCharacterForEgg, getPassionForEgg } from '../lib/viewHelpers'
import { CURRENT_USER_ID, DEMO_RECEIVABLE_EGG_ID, receiveEggLocally } from '../lib/localRepository'
import { COLLECTIONS } from '../types/firestore'
import {
  buildReceiveUrlForExchange,
  callCreateUrlExchange,
  ensureEggInFirestore,
} from '../firebase/exchange'
import type { Character, Egg, Exchange, Passion } from '../types/models'

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor
  }
}

type ExchangePageProps = {
  allEggs: Egg[]
  allPassions: Passion[]
  characters: Character[]
  eggs: Egg[]
  exchanges: Exchange[]
  onDataChange: (next: import('../types/models').AppData) => void
  userId: string
  userName: string
}

const MEETING_PRESETS = [
  'ハッカソン会場で出会った',
  'オンラインで知り合った',
  '友達の紹介',
  'SNS経由',
] as const

export function ExchangePage({
  allEggs,
  allPassions,
  characters,
  eggs,
  exchanges,
  onDataChange,
  userId,
  userName,
}: ExchangePageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<number | null>(null)

  const isReceiveMode = location.pathname.startsWith('/exchange/receive')
  const isShareMode = location.pathname.startsWith('/exchange/share') || location.pathname === '/exchange'
  const receiveEggId = searchParams.get('egg') ?? ''

  const [cameraStatus, setCameraStatus] = useState<
    'idle' | 'starting' | 'scanning' | 'previewOnly' | 'unsupported' | 'error'
  >('idle')
  const [scanResult, setScanResult] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [selectedEggId, setSelectedEggId] = useState(eggs[0]?.id ?? '')
  const [giftMessage, setGiftMessage] = useState('')
  const [meetingContext, setMeetingContext] = useState<string>(MEETING_PRESETS[0])
  const [customMeetingContext, setCustomMeetingContext] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [receiveStatus, setReceiveStatus] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  const [publishedExchangeId, setPublishedExchangeId] = useState('')
  const [publishedEggName, setPublishedEggName] = useState('')
  const [remoteOwnedEggs, setRemoteOwnedEggs] = useState<Egg[]>([])
  const [remotePassions, setRemotePassions] = useState<Passion[]>([])
  const [remoteCharacters, setRemoteCharacters] = useState<Character[]>([])
  const [qrUrl, setQrUrl] = useState('')
  const [qrStatus, setQrStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [qrError, setQrError] = useState('')

  const ownedEggs = useMemo(() => {
    const merged = [...eggs, ...remoteOwnedEggs]
    const seen = new Set<string>()
    return merged.filter((egg) => {
      if (seen.has(egg.id)) {
        return false
      }
      seen.add(egg.id)
      return true
    })
  }, [eggs, remoteOwnedEggs])
  const mergedPassions = useMemo(() => {
    const merged = [...allPassions, ...remotePassions]
    const seen = new Set<string>()
    return merged.filter((passion) => {
      if (seen.has(passion.id)) {
        return false
      }
      seen.add(passion.id)
      return true
    })
  }, [allPassions, remotePassions])
  const mergedCharacters = useMemo(() => {
    const merged = [...characters, ...remoteCharacters]
    const seen = new Set<string>()
    return merged.filter((character) => {
      if (seen.has(character.id)) {
        return false
      }
      seen.add(character.id)
      return true
    })
  }, [characters, remoteCharacters])

  const selectedEgg = ownedEggs.find((egg) => egg.id === selectedEggId) ?? ownedEggs[0]
  const selectedPassion = selectedEgg ? getPassionForEgg(mergedPassions, selectedEgg) : undefined
  const selectedCharacter = selectedEgg ? getCharacterForEgg(mergedCharacters, selectedEgg) : undefined

  const receiveEgg = useMemo(() => {
    if (!receiveEggId) {
      return undefined
    }

    return allEggs.find((egg) => egg.id === receiveEggId)
  }, [allEggs, receiveEggId])

  const receivePassion = receiveEgg ? getPassionForEgg(allPassions, receiveEgg) : undefined
  const receiveCharacter = receiveEgg ? getCharacterForEgg(characters, receiveEgg) : undefined
  const demoReceiveEgg = allEggs.find((egg) => egg.id === DEMO_RECEIVABLE_EGG_ID)
  const canDemoReceive =
    userId === CURRENT_USER_ID &&
    Boolean(demoReceiveEgg && demoReceiveEgg.currentOwnerUid !== userId)

  const resolvedMeetingContext = customMeetingContext.trim() || meetingContext
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const shareInput = selectedEgg
    ? {
        egg: selectedEgg,
        passion: selectedPassion,
        character: selectedCharacter,
        senderName: userName,
        giftMessage,
        meetingContext: resolvedMeetingContext,
        origin: window.location.origin,
      }
    : null

  const shareText = shareInput ? buildShareText(shareInput) : ''
  const lineShareUrl = shareText ? buildLineShareUrl(shareText) : ''
  const publishedReceiveUrl = publishedExchangeId
    ? buildReceiveUrlForExchange(publishedExchangeId)
    : ''
  const displayQrUrl = qrUrl || publishedReceiveUrl

  useEffect(() => {
    if (ownedEggs.length > 0 && !ownedEggs.some((egg) => egg.id === selectedEggId)) {
      setSelectedEggId(ownedEggs[0].id)
    }
  }, [ownedEggs, selectedEggId])

  useEffect(() => {
    if (!userId) {
      setRemoteOwnedEggs([])
      return
    }

    const loadOwnedEggs = async () => {
      const eggsRef = collection(db, COLLECTIONS.EGGS)
      const q = query(eggsRef, where('currentOwnerUid', '==', userId))
      const snap = await getDocs(q)
      const fetchedEggs: Egg[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as {
          sourceUserUid?: unknown
          basedOnPassionIds?: unknown
          basedOnPassionId?: unknown
          characterPrompt?: unknown
          hatchLevel?: unknown
          createdAt?: unknown
          currentOwnerUid?: unknown
          name?: unknown
          color?: unknown
          motif?: unknown
        }
        const basedOnPassionIds = Array.isArray(data.basedOnPassionIds)
          ? data.basedOnPassionIds.filter((v): v is string => typeof v === 'string')
          : typeof data.basedOnPassionId === 'string' && data.basedOnPassionId
            ? [data.basedOnPassionId]
            : []
        return {
          id: docSnap.id,
          sourceUserUid: typeof data.sourceUserUid === 'string' ? data.sourceUserUid : userId,
          basedOnPassionIds,
          characterPrompt: typeof data.characterPrompt === 'string' ? data.characterPrompt : '',
          hatchLevel: typeof data.hatchLevel === 'number' ? data.hatchLevel : 0,
          createdAt: new Date().toISOString(),
          currentOwnerUid: typeof data.currentOwnerUid === 'string' ? data.currentOwnerUid : userId,
          name: typeof data.name === 'string' && data.name ? data.name : 'たまご',
          color: typeof data.color === 'string' && data.color ? data.color : '#FF9B37',
          motif: data.motif === 'fox' || data.motif === 'cat' || data.motif === 'bird' ? data.motif : 'egg',
        }
      })
      setRemoteOwnedEggs(fetchedEggs)
    }

    void loadOwnedEggs().catch(() => setRemoteOwnedEggs([]))
  }, [userId])

  useEffect(() => {
    const missingPassionIds = Array.from(
      new Set(
        ownedEggs
          .flatMap((egg) => egg.basedOnPassionIds)
          .filter((id) => !allPassions.some((passion) => passion.id === id)),
      ),
    )
    const missingCharacterEggIds = ownedEggs
      .map((egg) => egg.id)
      .filter((eggId) => !characters.some((character) => character.eggId === eggId))

    if (missingPassionIds.length === 0) {
      setRemotePassions([])
    }
    if (missingCharacterEggIds.length === 0) {
      setRemoteCharacters([])
    }
    if (missingPassionIds.length === 0 && missingCharacterEggIds.length === 0) {
      return
    }

    const loadRemoteMenuData = async () => {
      const fetchedPassions = await Promise.all(
        missingPassionIds.map(async (passionId) => {
          const ref = doc(db, COLLECTIONS.PASSIONS, passionId)
          const snap = await getDoc(ref)
          if (!snap.exists()) {
            return null
          }
          const data = snap.data() as {
            ownerUid?: unknown
            title?: unknown
            description?: unknown
            tags?: unknown
            visibility?: unknown
          }
          return {
            id: snap.id,
            ownerUid: typeof data.ownerUid === 'string' ? data.ownerUid : '',
            title: typeof data.title === 'string' ? data.title : '偏愛タイトル未設定',
            description: typeof data.description === 'string' ? data.description : '',
            tags: Array.isArray(data.tags) ? data.tags.filter((v): v is string => typeof v === 'string') : [],
            createdAt: new Date().toISOString(),
            visibility: data.visibility === 'friends' || data.visibility === 'private' ? data.visibility : 'public',
          } satisfies Passion
        }),
      )
      setRemotePassions(fetchedPassions.filter((passion): passion is Passion => passion !== null))

      const fetchedCharacters = await Promise.all(
        missingCharacterEggIds.map(async (eggId) => {
          const ref = doc(db, COLLECTIONS.CHARACTERS, eggId)
          const snap = await getDoc(ref)
          if (!snap.exists()) {
            return null
          }
          const data = snap.data() as {
            eggId?: unknown
            name?: unknown
            personality?: unknown
            knowledgeAreas?: unknown
            growthLevel?: unknown
            affinityScore?: unknown
            unlockedTopics?: unknown
          }
          return {
            id: snap.id,
            eggId: typeof data.eggId === 'string' ? data.eggId : eggId,
            name: typeof data.name === 'string' ? data.name : 'キャラ未設定',
            personality: typeof data.personality === 'string' ? data.personality : '',
            knowledgeAreas: Array.isArray(data.knowledgeAreas)
              ? data.knowledgeAreas.filter((v): v is string => typeof v === 'string')
              : [],
            growthLevel: typeof data.growthLevel === 'number' ? data.growthLevel : 1,
            affinityScore: typeof data.affinityScore === 'number' ? data.affinityScore : 0,
            unlockedTopics: Array.isArray(data.unlockedTopics)
              ? data.unlockedTopics.filter((v): v is string => typeof v === 'string')
              : [],
          } satisfies Character
        }),
      )
      setRemoteCharacters(fetchedCharacters.filter((character): character is Character => character !== null))
    }

    void loadRemoteMenuData().catch(() => {
      setRemotePassions([])
      setRemoteCharacters([])
    })
  }, [ownedEggs, allPassions, characters])

  useEffect(() => {
    if (!shareStatus) {
      return
    }

    const timer = window.setTimeout(() => setShareStatus(''), 2400)
    return () => window.clearTimeout(timer)
  }, [shareStatus])

  const navigateToScanResult = (raw: string) => {
    const parsed = parseExchangeScanResult(raw)
    if (!parsed) {
      setReceiveStatus('このQRコードは交換用ではありません')
      return
    }

    if (parsed.kind === 'exchange-id') {
      navigate(`/exchange/receive/${parsed.exchangeId}`)
      return
    }

    navigate(`/exchange/receive?egg=${encodeURIComponent(parsed.eggId)}`)
  }

  useEffect(() => {
    if (!isShareMode || !selectedEgg || !userId) {
      setQrUrl('')
      setQrStatus('idle')
      return
    }

    let cancelled = false

    const publishQr = async () => {
      setQrStatus('loading')
      setQrError('')

      if (!auth.currentUser) {
        const fallbackUrl = buildReceiveUrl(selectedEgg.id)
        if (!cancelled) {
          setQrUrl(fallbackUrl)
          setQrStatus('ready')
        }
        return
      }

      try {
        await ensureEggInFirestore(selectedEgg, userId)
        const { exchangeId } = await callCreateUrlExchange(selectedEgg.id)
        if (cancelled) {
          return
        }
        const url = buildReceiveUrlForExchange(exchangeId)
        setPublishedExchangeId(exchangeId)
        setPublishedEggName(selectedEgg.name)
        setQrUrl(url)
        setQrStatus('ready')
      } catch (error: unknown) {
        if (cancelled) {
          return
        }
        const message = (error as { message?: string })?.message ?? 'QRの準備に失敗しました'
        setQrError(message)
        setQrUrl(buildReceiveUrl(selectedEgg.id))
        setQrStatus('error')
      }
    }

    void publishQr()

    return () => {
      cancelled = true
    }
  }, [isShareMode, selectedEgg?.id, userId])

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
          navigateToScanResult(firstCode)
        }
      }, 500)
    } catch {
      setCameraStatus('error')
    }
  }

  const submitManualCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (manualCode.trim()) {
      const value = manualCode.trim()
      setScanResult(value)
      setManualCode('')
      navigateToScanResult(value)
    }
  }

  const handleCopyShare = async () => {
    if (!shareText) {
      return
    }

    try {
      await copyShareText(shareText)
      setShareStatus('コピーしました')
    } catch {
      setShareStatus('コピーに失敗しました')
    }
  }

  const handleLineShare = () => {
    if (!lineShareUrl) {
      return
    }

    window.open(lineShareUrl, '_blank', 'noopener,noreferrer')
    setShareStatus('LINEを開きました')
  }

  const handlePublishUrlExchange = async () => {
    if (!selectedEgg || !userId) {
      setPublishError('卵を選択してログインしてください')
      return
    }

    setIsPublishing(true)
    setPublishError('')

    try {
      await ensureEggInFirestore(selectedEgg, userId)
      const { exchangeId } = await callCreateUrlExchange(selectedEgg.id)
      setPublishedExchangeId(exchangeId)
      setPublishedEggName(selectedEgg.name)
      setShareStatus('URLを発行しました')
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code ?? ''
      const message = (error as { message?: string })?.message ?? '不明なエラー'
      setPublishError(
        code
          ? `${code}: ${message}`
          : `発行に失敗しました: ${message}`,
      )
    } finally {
      setIsPublishing(false)
    }
  }

  const handleNativeShare = async () => {
    if (!shareInput) {
      return
    }

    try {
      const shared = await shareViaNativeSheet(shareInput)
      setShareStatus(shared ? '共有しました' : 'この端末では共有シートが使えません')
    } catch {
      setShareStatus('共有をキャンセルしました')
    }
  }

  const handleReceive = async () => {
    if (!receiveEgg) {
      setReceiveStatus('卵が見つかりませんでした')
      return
    }

    if (receiveEgg.currentOwnerUid === userId) {
      setReceiveStatus('すでにあなたの卵です')
      return
    }

    const nextData = receiveEggLocally(receiveEgg.id, userId, 'LINE共有リンクから受け取り')

    if (!nextData) {
      setReceiveStatus('受け取りに失敗しました')
      return
    }

    onDataChange(nextData)
    setReceiveStatus('受け取り完了！育成画面で会いに行こう')
    window.setTimeout(() => navigate(`/characters/${receiveEgg.id}`), 1200)
  }

  if (isReceiveMode) {
    return (
      <div className="screen exchange-screen">
        <Card className="exchange-hero">
          <p className="eyebrow">gift receive</p>
          <h1>卵を受け取る</h1>
          <p>偏愛が込められた卵が届いています。</p>
        </Card>

        {receiveEgg ? (
          <>
            <ExchangePreviewCard
              egg={receiveEgg}
              passion={receivePassion}
              character={receiveCharacter}
            />
            <Card className="exchange-receive-actions">
              <p className="status-message">
                受け取ると、この卵が育成画面に加わります。話しかけて孵化させましょう。
              </p>
              <Button type="button" onClick={handleReceive}>
                {receiveEgg.currentOwnerUid === userId ? 'すでに受け取り済み' : 'この卵を受け取る'}
              </Button>
              {receiveStatus ? <p className="scan-result">{receiveStatus}</p> : null}
            </Card>
          </>
        ) : (
          <Card>
            <EmptyReceiveState eggId={receiveEggId} />
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="screen exchange-screen">
      <Card className="exchange-hero">
        <h1 className="m-0 text-text-heading text-3xl font-black">交換</h1>
        <p className="m-0 text-text-heading text-lg font-extrabold">卵を交換する</p>
        <p className="m-0 text-text text-sm leading-relaxed">
          偏愛のお品書きを添えて渡す。会場ではQR、離れた相手にはLINE共有。
        </p>
        <div className="grid grid-cols-2 gap-1.5 rounded-[18px] bg-[#fff1df] p-1.5">
          <Link
            to="/exchange/share"
            className={`grid place-items-center min-h-[44px] rounded-[14px] text-sm font-black transition-all ${
              isShareMode
                ? 'bg-white text-primary-strong shadow-[0_4px_14px_rgba(231,115,0,0.14)]'
                : 'bg-transparent text-primary-strong/55 hover:text-primary-strong/80'
            }`}
          >
            渡す
          </Link>
          <Link
            to="/exchange/scan"
            className={`grid place-items-center min-h-[44px] rounded-[14px] text-sm font-black transition-all ${
              location.pathname.startsWith('/exchange/scan')
                ? 'bg-white text-primary-strong shadow-[0_4px_14px_rgba(231,115,0,0.14)]'
                : 'bg-transparent text-primary-strong/55 hover:text-primary-strong/80'
            }`}
          >
            読み取る
          </Link>
        </div>
      </Card>

      {isShareMode ? (
        <section className="exchange-share-panel">
          <div className="grid gap-2">
            <span className="text-sm font-extrabold text-text-heading">渡す卵を選ぶ</span>
            {ownedEggs.length > 0 ? (
              <div
                className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                role="listbox"
                aria-label="渡す卵を選ぶ"
              >
                {ownedEggs.map((egg) => {
                  const isSelected = egg.id === selectedEggId

                  return (
                    <button
                      key={egg.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      aria-label={egg.name}
                      onClick={() => setSelectedEggId(egg.id)}
                      className={`shrink-0 snap-start grid w-[100px] gap-2 place-items-center rounded-3xl border p-3 pt-4 text-center transition-all ${
                        isSelected
                          ? 'border-primary-strong bg-white shadow-[0_8px_22px_rgba(231,115,0,0.16)]'
                          : 'border-[rgba(255,155,55,0.12)] bg-[#fff8f0] hover:border-[rgba(255,155,55,0.28)]'
                      }`}
                    >
                      <div className="grid h-[82px] w-[66px] place-items-center">
                        <EggArt egg={egg} label="" />
                      </div>
                      <strong className="max-w-full truncate text-xs font-black text-text-heading">{egg.name}</strong>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="status-message">渡せる卵がありません。先に偏愛を登録してください。</p>
            )}
          </div>

          {selectedEgg ? (
            <ExchangePreviewCard
              egg={selectedEgg}
              passion={selectedPassion}
              character={selectedCharacter}
              senderName={userName}
            />
          ) : (
            <Card>
              <p className="status-message">渡せる卵がありません。先に偏愛を登録してください。</p>
            </Card>
          )}

          <Card className="exchange-message-card">
            <Textarea
              label="一言メッセージ（任意）"
              placeholder="例: この子、『なぜ好き？』って聞くと嬉しがります"
              rows={3}
              maxLength={140}
              value={giftMessage}
              onChange={(event) => setGiftMessage(event.target.value)}
              helperText="受け取った相手への手紙として、LINE文面にも添付されます。"
            />

            <div className="field">
              <span>出会いメモ</span>
              <div className="meeting-preset-list">
                {MEETING_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`meeting-preset${meetingContext === preset && !customMeetingContext.trim() ? ' is-active' : ''}`}
                    onClick={() => {
                      setMeetingContext(preset)
                      setCustomMeetingContext('')
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <TextField
                label="自由入力（任意）"
                placeholder="例: ラジオ好きと名乗った人と"
                value={customMeetingContext}
                onChange={(event) => setCustomMeetingContext(event.target.value)}
              />
            </div>
          </Card>

          {selectedEgg ? (
            <Card className="exchange-share-actions">
              <div className="section-title-row">
                <h2>共有する</h2>
                <span>{shareStatus || 'share'}</span>
              </div>

              <div className="share-action-grid">
                <Button
                  type="button"
                  onClick={handlePublishUrlExchange}
                  disabled={isPublishing}
                >
                  {isPublishing ? '発行中...' : '共有URLを発行する (Firestore)'}
                </Button>
                {publishError ? (
                  <p className="status-message" style={{ color: '#c0392b' }}>
                    {publishError}
                  </p>
                ) : null}
                {publishedReceiveUrl ? (
                  <Card>
                    <p className="status-message">発行済みURL（{publishedEggName || '選択中の卵'}）</p>
                    <p className="share-code">
                      <strong style={{ wordBreak: 'break-all' }}>{publishedReceiveUrl}</strong>
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(`/exchange/wait/${publishedExchangeId}`)}
                    >
                      受け取り待機画面を開く
                    </Button>
                  </Card>
                ) : null}

                <StackedActionButton
                  icon="L"
                  title="LINEで渡す (ローカルデモ)"
                  description="偏愛つきメッセージをそのまま送れます"
                  variant="line"
                  onClick={handleLineShare}
                />

                <Button type="button" variant="secondary" onClick={handleCopyShare}>
                  文面をコピー
                </Button>

                {canNativeShare ? (
                  <Button type="button" variant="ghost" onClick={handleNativeShare}>
                    共有シートを開く
                  </Button>
                ) : null}
              </div>

              <div className="own-qr-card" aria-label="自分の交換QR">
                {qrStatus === 'loading' ? (
                  <div className="grid h-[132px] w-[132px] place-items-center rounded-2xl bg-white text-xs font-bold text-[#8A8A8A]">
                    QR準備中...
                  </div>
                ) : displayQrUrl ? (
                  <ExchangeQrCode value={displayQrUrl} />
                ) : (
                  <div className="grid h-[132px] w-[132px] place-items-center rounded-2xl bg-white text-xs font-bold text-[#8A8A8A]">
                    卵を選んでください
                  </div>
                )}
                <div>
                  <p>会場ではQR</p>
                  <strong>{selectedEgg.name}</strong>
                  {qrStatus === 'error' ? (
                    <p className="mt-1 text-[11px] font-semibold leading-relaxed text-[#c0392b]">
                      本番URLの発行に失敗したため、デモ用リンクのQRを表示しています。
                    </p>
                  ) : null}
                  {qrError ? (
                    <p className="mt-1 text-[10px] leading-relaxed text-[#8A8A8A]">{qrError}</p>
                  ) : null}
                </div>
              </div>

              <div className="share-code">
                <span>受け取りリンク</span>
                <strong>{displayQrUrl || buildReceiveUrl(selectedEgg.id)}</strong>
              </div>
            </Card>
          ) : null}
        </section>
      ) : null}

      {!isShareMode ? (
        <section className="exchange-duo exchange-duo--scan">
          <Card className="center-panel exchange-card">
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
                <p>交換ページへ移動します。うまくいかない場合は下の手入力も使えます。</p>
              </div>
            ) : null}
            {receiveStatus ? <p className="status-message">{receiveStatus}</p> : null}
          </Card>

          <form className="panel manual-scan-form" onSubmit={submitManualCode}>
            <TextField
              label="読み取りコードを手入力"
              value={manualCode}
              onChange={(event) => setManualCode(event.target.value)}
              placeholder="例: egg-guest-gift"
            />
            <Button type="submit" variant="secondary">
              読み取り扱いにする
            </Button>
          </form>

          {canDemoReceive && demoReceiveEgg ? (
            <Card className="exchange-card">
              <p className="m-0 text-sm font-extrabold text-text-heading">デモ: 卵を受け取る</p>
              <p className="mt-2 mb-3 text-xs leading-relaxed text-text">
                会場デモでは、QR の代わりにこちらから「タビトル」の卵を受け取れます。受け取ると育成画面で卵が表示されます。
              </p>
              <Link
                to={`/exchange/receive?egg=${demoReceiveEgg.id}`}
                className="inline-flex h-10 items-center rounded-full bg-[#FF9B37] px-4 text-xs font-bold text-[#FFFCF4]"
              >
                {demoReceiveEgg.name}の卵を受け取る
              </Link>
            </Card>
          ) : null}
        </section>
      ) : null}

      <Card>
        <h2>交換履歴</h2>
        <div className="passion-stack">
          {exchanges.length > 0 ? (
            exchanges.map((exchange) => (
              <article className="passion-row" key={exchange.id}>
                <div>
                  <strong>{exchange.meetingContext}</strong>
                  <p>eggId: {exchange.eggId}</p>
                </div>
                <span>{formatShortDate(exchange.createdAt)}</span>
              </article>
            ))
          ) : (
            <p className="status-message">まだ交換履歴はありません。</p>
          )}
        </div>
      </Card>
    </div>
  )
}

function EmptyReceiveState({ eggId }: { eggId: string }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">?</div>
      <h3>卵が見つかりません</h3>
      <p>
        {eggId
          ? `ID「${eggId}」の卵はこの端末のデモデータにありません。本番ではFirestoreから取得します。`
          : '受け取りリンクに卵IDが含まれていません。'}
      </p>
    </div>
  )
}
