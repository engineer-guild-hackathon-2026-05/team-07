import { CharacterIllustration } from '../../components/CharacterIllustration'
import type { Character, Egg } from '../../../types/models'

interface Props {
  character: Character
  egg: Egg
}

const MOTIF_EMOJI: Record<Egg['motif'], string> = {
  egg: '🥚',
  fox: '🦊',
  cat: '🐱',
  bird: '🐦',
}

export function CharacterAvatar({ character, egg }: Props) {
  const growth = Math.min(100, Math.max(0, character.growthLevel * 20))
  const affinity = Math.min(100, Math.max(0, character.affinityScore))

  return (
    <div className="character-chat-header flex flex-col items-center gap-2.5 px-5 pt-5 pb-3 border-b border-[#ff9b37]/20 shrink-0">
      <CharacterIllustration egg={egg} size="medium" showPedestal alt={character.name} />

      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-lg font-black text-[#1f1f1f]">
          {MOTIF_EMOJI[egg.motif]} {character.name}
        </span>
        <span className="text-xs text-[#494949]/60 max-w-[260px]">{character.personality}</span>
      </div>

      <div className="flex flex-col gap-1.5 w-full max-w-[260px]">
        <GrowthMeter label="成長" value={growth} color="#ff9b37" />
        <GrowthMeter label="親密度" value={affinity} color="#4edbfb" />
      </div>
    </div>
  )
}

function GrowthMeter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[#494949]/60 w-10 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#f1e7dc] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[11px] text-[#494949]/60 w-6 text-right">{value}</span>
    </div>
  )
}
