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
    <nav className="bottom-nav" aria-label="メインナビゲーション">
      {navItems.map((item) => {
        const path = item.path === '/characters' && firstCharacterId ? `/characters/${firstCharacterId}` : item.path
        const isActive =
          item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.match ?? item.path)

        return (
          <Link
            key={item.path}
            to={path}
            className={isActive ? 'is-active' : ''}
            aria-label={item.label}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </Link>
        )
      })}
    </nav>
  )
}
