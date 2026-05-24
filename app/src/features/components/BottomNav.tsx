import { Link, useLocation } from 'react-router-dom'

type BottomNavProps = {
  firstCharacterId?: string
}

const navItems: Array<{ path: string; label: string; icon: string; match?: string }> = [
  { path: '/', label: 'Home', icon: '⌂' },
  { path: '/passions/new', label: '偏愛', icon: '▣' },
  { path: '/exchange/share', label: '交換', icon: '⇄', match: '/exchange' },
  { path: '/characters', label: '育成', icon: '✦', match: '/characters' },
  { path: '/profile', label: 'Profile', icon: '⚙' },
]

export function BottomNav({ firstCharacterId }: BottomNavProps) {
  const location = useLocation()

  return (
    <nav
      className="absolute left-6 right-6 bottom-[26px] grid grid-cols-5 gap-1 rounded-[20px] p-2.5 bg-orange shadow-[0_12px_24px_rgba(231,115,0,0.28)]"
      aria-label="メインナビゲーション"
    >
      {navItems.map((item) => {
        const path = item.path === '/characters' && firstCharacterId ? `/characters/${firstCharacterId}` : item.path
        const isActive =
          item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.match ?? item.path)

        return (
          <Link
            key={item.path}
            to={path}
            className={`grid place-items-center content-center gap-px h-[50px] rounded-sm font-black no-underline ${
              isActive ? 'text-orange-dark bg-white' : 'text-white bg-transparent'
            }`}
            aria-label={item.label}
          >
            <span className="text-2xl leading-none">{item.icon}</span>
            <small className="text-[9px] leading-none">{item.label}</small>
          </Link>
        )
      })}
    </nav>
  )
}
