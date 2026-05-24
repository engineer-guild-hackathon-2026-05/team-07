import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EggArt } from '../features/components/EggArt'
import { Button, Card, TextField } from '../features/components/ui'
import { formatShortDate } from '../lib/viewHelpers'
import type { Egg, Exchange } from '../types/models'

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor
  }
}

type ExchangePageProps = {
  eggs: Egg[]
  exchanges: Exchange[]
}

export function ExchangePage({ eggs, exchanges }: ExchangePageProps) {
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
      <Card className="exchange-hero">
        <p className="eyebrow">exch-01 / exch-02</p>
        <h1>卵を交換する</h1>
        <p>相手のQRを読む、自分のQRを見せる、どちらもこの画面で行います。</p>
        <div className="segment-tabs">
          <Link to="/exchange/share">見せる</Link>
          <Link to="/exchange/scan">読み取る</Link>
        </div>
      </Card>

      <section className="exchange-duo">
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

        <Card className="center-panel exchange-card">
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
        </Card>
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

      <Card>
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
      </Card>
    </div>
  )
}
