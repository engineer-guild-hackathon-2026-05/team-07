import { Link, useNavigate } from 'react-router-dom'
import { EggCard } from '../features/components/EggCard'
import { activateEggForNurturing } from '../lib/localRepository'
import type { AppData, Egg } from '../types/models'

type ReceiveEggSetupPageProps = {
  data: AppData
  unassignedEggs: Egg[]
  userId: string
  onDataChange: (next: AppData) => void
}

export function ReceiveEggSetupPage({ data, unassignedEggs, userId, onDataChange }: ReceiveEggSetupPageProps) {
  const navigate = useNavigate()

  const handleActivate = (eggId: string) => {
    const next = activateEggForNurturing(data, userId, eggId)
    onDataChange(next)
    navigate(`/characters/${eggId}`)
  }

  return (
    <div className="screen grid gap-4 bg-[#FBF6EC]">
      <header className="pt-1">
        <h1 className="m-0 text-text-heading text-2xl font-black">卵を受け取る</h1>
        <p className="mt-2 mb-0 text-sm leading-relaxed text-[#5C5C5C]">
          育てる卵を選んでください。交換で受け取った卵や、偏愛から生まれた卵をここでセッティングできます。
        </p>
      </header>

      {unassignedEggs.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="m-0 text-sm font-extrabold text-text-heading">所有している卵</h2>
          {unassignedEggs.map((egg) => (
            <div key={egg.id} className="grid gap-2">
              <EggCard egg={egg} />
              <button
                type="button"
                onClick={() => handleActivate(egg.id)}
                className="flex h-10 items-center justify-center rounded-full bg-[#FF9B37] px-4 text-[13px] font-bold text-[#FFFCF4]"
              >
                この卵を育てる
              </button>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-[rgba(255,155,55,0.14)] bg-white px-4 py-6 text-center shadow-[0_10px_28px_rgba(73,73,73,0.06)]">
          <p className="m-0 text-sm font-bold text-[#494949]">まだ所有している卵がありません</p>
          <p className="mt-2 mb-0 text-xs leading-relaxed text-[#5C5C5C]">
            交換で卵を受け取るか、偏愛を登録して卵を生成してください。
          </p>
        </section>
      )}

      <section className="rounded-3xl border border-[rgba(255,155,55,0.14)] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(73,73,73,0.06)]">
        <h2 className="m-0 text-sm font-extrabold text-text-heading">交換で受け取る</h2>
        <p className="mt-2 mb-3 text-xs leading-relaxed text-[#5C5C5C]">
          QRコードや共有リンクから、他の人の偏愛卵を受け取れます。
        </p>
        <Link
          to="/exchange/scan"
          className="inline-flex h-10 items-center rounded-full bg-[#FF9B37] px-4 text-xs font-bold text-[#FFFCF4]"
        >
          交換画面を開く
        </Link>
      </section>

      <div className="text-right">
        <Link to="/characters" className="text-xs font-semibold text-[#E77300] underline-offset-2 hover:underline">
          育成画面に戻る
        </Link>
      </div>
    </div>
  )
}
