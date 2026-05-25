import type { HTMLAttributes, ReactNode } from 'react'

type ScreenProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

const SCREEN =
  'h-full min-h-svh overflow-y-auto box-border pt-7 px-[22px] pb-[calc(70px+env(safe-area-inset-bottom,0px)+20px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:w-[min(100%,1080px)] md:mx-auto md:py-9 md:px-10 md:pb-12 md:h-svh md:max-h-svh'

export function Screen({ children, className = '', ...props }: ScreenProps) {
  return (
    <div className={`${SCREEN} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
