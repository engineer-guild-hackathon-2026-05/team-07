import { useEffect, useState } from 'react'
import { charactersBg } from '../../lib/characterAssets'
import loginHeroGif from '../../assets/login-hero.gif'

const VIDEO_SOURCES = ['/login-hero.mp4', '/login-hero.webm'] as const

export function LoginCinematicBackground() {
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduceMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const showVideo = !reduceMotion && !videoFailed && videoReady

  return (
    <div className="login-cinematic" aria-hidden>
      {!reduceMotion && !videoFailed ? (
        <video
          className={`login-cinematic__video${showVideo ? ' is-visible' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={charactersBg}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoFailed(true)}
        >
          {VIDEO_SOURCES.map((src) => (
            <source key={src} src={src} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          ))}
        </video>
      ) : null}

      <div className={`login-cinematic__fallback${showVideo ? ' is-hidden' : ''}`}>
        <img src={charactersBg} alt="" className="login-cinematic__bg" />
        <img src={loginHeroGif} alt="" className="login-cinematic__gif" />
      </div>

      <div className="login-cinematic__overlay" />
      <div className="login-cinematic__glow login-cinematic__glow--mint" />
      <div className="login-cinematic__glow login-cinematic__glow--orange" />
    </div>
  )
}
