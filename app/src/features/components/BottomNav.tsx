import type { AppRoute } from '../../types/models'

type BottomNavProps = {
  activeRoute: AppRoute
  onNavigate: (route: AppRoute) => void
}

const navItems: Array<{ route: AppRoute; label: string; icon: string }> = [
  { route: 'home', label: 'Home', icon: '⌂' },
  { route: 'add', label: '偏愛', icon: '▣' },
  { route: 'exchange', label: '交換', icon: '⇄' },
  { route: 'grow', label: '育成', icon: '✦' },
  { route: 'profile', label: 'Profile', icon: '⚙' },
]

export function BottomNav({ activeRoute, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="メインナビゲーション">
      {navItems.map((item) => (
        <button
          type="button"
          key={item.route}
          className={activeRoute === item.route ? 'is-active' : ''}
          onClick={() => onNavigate(item.route)}
          aria-label={item.label}
        >
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  )
}
