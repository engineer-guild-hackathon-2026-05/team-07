import type { CSSProperties } from 'react'
import type { Egg } from '../../types/models'

export function Mascot({ egg, size = 'large' }: { egg?: Pick<Egg, 'color'>; size?: 'large' | 'small' }) {
  return (
    <div className={`mascot mascot--${size}`} style={{ '--mascot-color': egg?.color } as CSSProperties}>
      <div className="mascot-ear mascot-ear--left" />
      <div className="mascot-ear mascot-ear--right" />
      <div className="mascot-body">
        <span className="mascot-eye mascot-eye--left" />
        <span className="mascot-eye mascot-eye--right" />
        <span className="mascot-mouth" />
      </div>
      <div className="mascot-tail" />
    </div>
  )
}
