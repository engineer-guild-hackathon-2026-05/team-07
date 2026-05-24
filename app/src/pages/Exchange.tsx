import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EggArt } from '../features/components/EggArt'
import { Button, Card, TextField } from '../features/components/ui'
import { formatShortDate } from '../lib/viewHelpers'
import type { Egg, Exchange } from '../types/models'

const screenClasses =
  'h-full overflow-y-auto box-border px-[22px] pt-7 pb-28 flex flex-col gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

const selectClasses =
  'w-full box-border border-2 border-border rounded-md px-4 py-3.5 bg-cream-light text-text-h font-[inherit]'

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
    <div className={screenClasses}>
      <Card className="grid gap-2">
        <p className="text-orange-dark text-xs font-extrabold uppercase tracking-wider">exch-01 / exch-02</p>
        <h1 className="text-text-h">卵を交換する</h1>
        <p className="text-text">相手のQRを読む、自分のQRを見せる、どちらもこの画面で行います。</p>
        <div className="grid grid-cols-2 gap-2 rounded-md p-1.5 bg-cream-tab">
          <Link
            to="/exchange/share"
            className="grid place-items-center min-h-[42px] rounded-sm text-orange-dark bg-white font-black"
          >
            見せる
          </Link>
          <Link
            to="/exchange/scan"
            className="grid place-items-center min-h-[42px] rounded-sm text-orange-dark bg-white font-black"
          >
            読み取る
          </Link>
        </div>
      </Card>

      <section className="grid gap-3.5 mt-3.5">
        <Card className="grid justify-items-center gap-3.5 text-center">
          <div className="flex justify-between items-center gap-3 w-full">
            <h2 className="text-text-h">相手のQRを読む</h2>
            <span className="text-orange-dark text-xs font-extrabold">
              {cameraStatus === 'scanning' ? '読み取り中' : 'scan'}
            </span>
          </div>
          <div className="camera-frame relative w-full aspect-square overflow-hidden rounded-lg bg-text-h">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              aria-label="QR読み取りカメラ"
            />
            {cameraStatus !== 'scanning' && cameraStatus !== 'previewOnly' ? (
              <div className="absolute inset-0 grid place-items-center content-center gap-2.5 p-6 text-white text-center bg-gradient-to-br from-orange/90 via-mint/78 to-text">
                <span className="grid place-items-center w-24 h-24 border-8 border-white rounded-[20px] font-black">
                  QR
                </span>
                <p>枠の中に相手のQRを合わせます</p>
              </div>
            ) : null}
            <i />
          </div>
          <div className="w-full">
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
            <p className="w-full rounded-md px-3.5 py-3 bg-cream text-left text-text">
              カメラは使えますが、このブラウザはQR自動検出に未対応です。下の手入力で動線確認できます。
            </p>
          ) : null}
          {cameraStatus === 'unsupported' ? (
            <p className="w-full rounded-md px-3.5 py-3 bg-cream text-left text-text">
              このブラウザまたは表示URLではカメラを起動できません。HTTPS、localhost、ブラウザ権限を確認してください。
            </p>
          ) : null}
          {cameraStatus === 'error' ? (
            <p className="w-full rounded-md px-3.5 py-3 bg-cream text-left text-text">
              カメラを起動できませんでした。権限やHTTPS設定を確認してください。
            </p>
          ) : null}
          {scanResult ? (
            <div className="grid gap-1.5 w-full rounded-md px-3.5 py-3 bg-tag-bg text-left">
              <span className="text-tag-text text-xs font-black">読み取り結果</span>
              <strong className="break-all text-text-h">{scanResult}</strong>
              <p className="text-text">本番ではこの値を交換Functionへ渡して、卵の所有者を更新します。</p>
            </div>
          ) : null}
        </Card>

        <Card className="grid justify-items-center gap-4 text-left">
          <div className="flex justify-between items-center gap-3 w-full">
            <h2 className="text-text-h">自分のQRを見せる</h2>
            <span className="text-orange-dark text-xs font-extrabold">share</span>
          </div>
          <div className="grid grid-cols-[132px_1fr] gap-3.5 items-center w-full rounded-3xl p-3.5 bg-cream" aria-label="自分の交換QR">
            <div className="qr-mock qr-mock--share">
              <span />
              <span />
              <span />
              <strong>QR</strong>
            </div>
            <div>
              <p className="mb-1 text-orange-dark text-xs font-black">渡す卵</p>
              <strong className="text-text-h text-xl leading-tight">{selectedEgg?.name ?? '卵がありません'}</strong>
            </div>
          </div>
          <label className="grid gap-2 w-full">
            <span className="text-text-h font-black">見せる卵を選ぶ</span>
            <select
              className={selectClasses}
              value={selectedEgg?.id ?? ''}
              onChange={(event) => setSelectedEggId(event.target.value)}
            >
              {eggs.map((egg) => (
                <option value={egg.id} key={egg.id}>
                  {egg.name} / 孵化 {egg.hatchLevel}%
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-1 w-full rounded-md px-3.5 py-3 bg-tag-bg">
            <span className="text-tag-text text-xs font-black">交換コード</span>
            <strong className="break-all text-text-h text-[13px]">{shareCode}</strong>
          </div>
          <p className="w-full rounded-md px-3.5 py-3 bg-cream text-text">
            本番ではこのコードを実QRにして、一時トークン付きで表示します。
          </p>
        </Card>
      </section>

      <form
        className="border border-orange/12 rounded-lg bg-white shadow-soft p-5 grid gap-3 mt-3.5"
        onSubmit={submitManualCode}
      >
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

      <div className="grid gap-3 mt-4">
        {eggs.map((egg) => (
          <article
            className="grid grid-cols-[86px_1fr] gap-3 items-center border border-orange/12 rounded-lg bg-white shadow-soft p-3.5"
            key={egg.id}
          >
            <EggArt egg={egg} />
            <div>
              <strong className="text-text-h">{egg.name}</strong>
              <p className="text-text">孵化 {egg.hatchLevel}%</p>
            </div>
          </article>
        ))}
      </div>

      <Card>
        <h2 className="text-text-h mb-3">交換履歴</h2>
        <div className="grid gap-3">
          {exchanges.map((exchange) => (
            <article className="grid grid-cols-[1fr_auto] gap-3 items-start p-3.5 rounded-md bg-cream" key={exchange.id}>
              <div>
                <strong className="block mb-1 text-text-h">{exchange.meetingContext}</strong>
                <p className="text-text">eggId: {exchange.eggId}</p>
              </div>
              <span className="text-orange-dark text-xs font-extrabold">{formatShortDate(exchange.createdAt)}</span>
            </article>
          ))}
        </div>
      </Card>
    </div>
  )
}
