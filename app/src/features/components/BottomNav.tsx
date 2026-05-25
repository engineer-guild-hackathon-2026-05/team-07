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

export function BottomNav({ firstCharacterId }: BottomNavProps) {
  const location = useLocation()

  return (
    <nav className="app-nav" aria-label="メインナビゲーション">
      <div className="app-nav__brand">
        <p className="eyebrow">HenAi Egg</p>
        <strong>偏愛の卵</strong>
      </div>

      <div className="app-nav__links">
        {navItems.map((item) => {
          const path = item.path === '/characters' && firstCharacterId ? `/characters/${firstCharacterId}` : item.path
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.match ?? item.path)

          return (
            <Link
              key={item.path}
              to={path}
              className={isActive ? 'is-active' : ''}
              aria-label={item.ariaLabel}
              title={item.ariaLabel}
            >
              <span className="app-nav__icon">{item.icon}</span>
              <span className="app-nav__label">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* <Link to="/dev/style" className="app-nav__footer">
        Design System
      </Link> */}
    </nav>
  )
}
