import { QRCodeSVG } from 'qrcode.react'

type ExchangeQrCodeProps = {
  value: string
  size?: number
  label?: string
}

export function ExchangeQrCode({ value, size = 132, label = '交換用QRコード' }: ExchangeQrCodeProps) {
  if (!value) {
    return null
  }

  return (
    <QRCodeSVG
      value={value}
      size={size}
      level="M"
      includeMargin
      role="img"
      aria-label={label}
      className="rounded-2xl bg-white p-2 shadow-[inset_0_0_0_1px_rgba(231,115,0,0.08)]"
    />
  )
}
