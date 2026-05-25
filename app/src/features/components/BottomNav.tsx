import { Link, useLocation } from 'react-router-dom'

type BottomNavProps = {
  firstCharacterId?: string
}

const navItems: Array<{ path: string; label: string; icon: string; ariaLabel: string; match?: string }> = [
  { path: '/', label: 'Home', icon: '⌂', ariaLabel: 'ホーム' },
  { path: '/passions/new', label: '偏愛', icon: '♥', ariaLabel: '偏愛を登録する' },
  { path: '/exchange/share', label: '交換', icon: '⇄', ariaLabel: '卵を交換する', match: '/exchange' },
  { path: '/characters', label: '育成', icon: '✦', ariaLabel: 'キャラを育てる', match: '/characters' },
  { path: '/profile', label: 'Profile', icon: '⚙', ariaLabel: 'プロフィール' },
]

const NAV =
  'z-30 fixed left-0 right-0 bottom-0 grid grid-cols-5 gap-1 w-full rounded-t-[20px] px-2.5 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] bg-primary border-t border-[rgba(255,255,255,0.18)] shadow-[0_-10px_28px_rgba(231,115,0,0.22)] md:sticky md:top-0 md:left-auto md:bottom-auto md:flex md:flex-col md:gap-6 md:w-auto md:h-svh md:rounded-none md:px-[18px] md:py-7 md:bg-white md:border-t-0 md:border-r md:border-border md:shadow-none'

const LINK_BASE =
  'grid place-items-center content-center gap-px h-[50px] rounded-[14px] bg-transparent font-black md:grid-cols-[36px_1fr] md:gap-2.5 md:items-center md:justify-items-start md:h-auto md:min-h-[46px] md:px-3 md:py-2.5 md:rounded-[14px] md:text-left'

const LINK_INACTIVE = 'text-white md:text-text-heading'

const LINK_ACTIVE =
  'text-primary-strong bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] md:bg-[#fff1df] md:shadow-none'

export function BottomNav({ firstCharacterId }: BottomNavProps) {
  const location = useLocation()

  return (
    <nav className={NAV} aria-label="メインナビゲーション">
      <div className="hidden md:grid md:gap-1 md:px-2.5 md:pb-2 md:border-b md:border-border">
        <p className="m-0 text-primary-strong text-xs font-extrabold tracking-widest uppercase">HenAi Egg</p>
        <strong className="text-primary-strong text-xl font-black">偏愛の卵</strong>
      </div>

      <div className="contents md:grid md:gap-1.5 md:flex-1">
        {navItems.map((item) => {
          const path = item.path === '/characters' && firstCharacterId ? `/characters/${firstCharacterId}` : item.path
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.match ?? item.path)

          return (
            <Link
              key={item.path}
              to={path}
              className={`${LINK_BASE} ${isActive ? LINK_ACTIVE : LINK_INACTIVE}`.trim()}
              aria-label={item.ariaLabel}
              title={item.ariaLabel}
            >
              <span
                className={`text-2xl leading-none md:grid md:place-items-center md:w-9 md:h-9 md:rounded-xl md:text-lg ${
                  isActive ? 'md:bg-white' : 'md:bg-[#fff8f0]'
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[9px] leading-none font-black md:text-sm md:font-black">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
