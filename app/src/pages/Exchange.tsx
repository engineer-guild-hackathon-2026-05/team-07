import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, StackedActionButton, TextField, Textarea } from '../components/ui'
import { ExchangePreviewCard } from '../features/components/ExchangePreviewCard'
import { EggArt } from '../features/components/EggArt'
import {
  buildLineShareUrl,
  buildShareText,
  copyShareText,
  shareViaNativeSheet,
} from '../lib/exchangeShare'
import { formatShortDate, getCharacterForEgg, getPassionForEgg } from '../lib/viewHelpers'
import { receiveEggLocally } from '../lib/localRepository'
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

  const selectedEgg = eggs.find((egg) => egg.id === selectedEggId) ?? eggs[0]
  const selectedPassion = selectedEgg ? getPassionForEgg(allPassions, selectedEgg) : undefined
  const selectedCharacter = selectedEgg ? getCharacterForEgg(characters, selectedEgg) : undefined

  const receiveEgg = useMemo(() => {
    if (!receiveEggId) {
      return undefined
    }

    return allEggs.find((egg) => egg.id === receiveEggId)
  }, [allEggs, receiveEggId])

  const receivePassion = receiveEgg ? getPassionForEgg(allPassions, receiveEgg) : undefined
  const receiveCharacter = receiveEgg ? getCharacterForEgg(characters, receiveEgg) : undefined

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

  useEffect(() => {
    if (eggs.length > 0 && !eggs.some((egg) => egg.id === selectedEggId)) {
      setSelectedEggId(eggs[0].id)
    }
  }, [eggs, selectedEggId])

  useEffect(() => {
    if (!shareStatus) {
      return
    }

    const timer = window.setTimeout(() => setShareStatus(''), 2400)
    return () => window.clearTimeout(timer)
  }, [shareStatus])

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
    window.setTimeout(() => navigate('/'), 1800)
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
                受け取ると、この卵とキャラクターがあなたのホームに加わります。
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
        <p className="eyebrow">exch-01 / exch-02</p>
        <h1>卵を交換する</h1>
        <p>偏愛のお品書きを添えて渡す。会場ではQR、離れた相手にはLINE共有。</p>
        <div className="segment-tabs">
          <Link to="/exchange/share" className={isShareMode ? 'is-active' : ''}>
            渡す
          </Link>
          <Link to="/exchange/scan" className={location.pathname.startsWith('/exchange/scan') ? 'is-active' : ''}>
            読み取る
          </Link>
        </div>
      </Card>

      {isShareMode ? (
        <section className="exchange-share-panel">
          <label className="field compact-field">
            <span>渡す卵を選ぶ</span>
            <select value={selectedEgg?.id ?? ''} onChange={(event) => setSelectedEggId(event.target.value)}>
              {eggs.map((egg) => (
                <option value={egg.id} key={egg.id}>
                  {egg.name} / 孵化 {egg.hatchLevel}%
                </option>
              ))}
            </select>
          </label>

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
                <StackedActionButton
                  icon="L"
                  title="LINEで渡す"
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
                <div className="qr-mock qr-mock--share">
                  <span />
                  <span />
                  <span />
                  <strong>QR</strong>
                </div>
                <div>
                  <p>会場ではQR</p>
                  <strong>{selectedEgg.name}</strong>
                </div>
              </div>

              <div className="share-code">
                <span>受け取りリンク</span>
                <strong>{`${window.location.origin}/exchange/receive?egg=${selectedEgg.id}`}</strong>
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
                <p>本番ではこの値を交換Functionへ渡して、卵の所有者を更新します。</p>
              </div>
            ) : null}
          </Card>

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
        </section>
      ) : null}

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
