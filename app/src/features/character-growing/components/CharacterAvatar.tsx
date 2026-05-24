import { useState } from 'react'
import type { Character, Egg } from '../../../types/models'
import { Modal } from '../../../components/ui'
import charBlueImg from '../../../assets/char_blue.png'

interface Props {
  character: Character
  egg: Egg
}

export function CharacterAvatar({ character, egg }: Props) {
  const [showStatus, setShowStatus] = useState(false)
  // egg is reserved for future use (character color, motif, etc.)
  void egg

  return (
    <>
      <div className="flex flex-col items-center gap-3 px-5 pt-5 pb-4 border-b border-[#f1e7dc] shrink-0">
        {/* Name + affinity — above the image */}
        <div className="flex items-center justify-between w-full px-2">
          <span className="text-lg font-black text-[#1f1f1f]">{character.name}</span>
          <AffinityBadge value={character.affinityScore} />
        </div>

        {/* Character image */}
        <img
          src={charBlueImg}
          alt={character.name}
          className="h-36 w-auto object-contain drop-shadow-md"
        />

        {/* Status button */}
        <button
          type="button"
          onClick={() => setShowStatus(true)}
          className="text-xs text-[#e77300] font-bold px-3 py-1 rounded-full border border-[#f1e7dc] bg-[#fff8f0] hover:bg-[#fff1df] transition-colors"
        >
          ステータスを見る ›
        </button>
      </div>

      {/* Status modal */}
      <Modal isOpen={showStatus} onClose={() => setShowStatus(false)} title="キャラクターステータス">
        <div className="flex flex-col gap-4 mt-2">
          <StatusRow label="性格">
            <p className="text-sm text-[#494949]">{character.personality}</p>
          </StatusRow>

          <StatusRow label="成長レベル">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#f1e7dc] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff9b37] rounded-full transition-[width] duration-300"
                  style={{ width: `${Math.min(100, character.growthLevel * 20)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-[#e77300]">Lv.{character.growthLevel}</span>
            </div>
          </StatusRow>

          <StatusRow label="親密度">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#fce7f3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-300 rounded-full transition-[width] duration-300"
                  style={{ width: `${Math.min(100, character.affinityScore)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-pink-400">{character.affinityScore}</span>
            </div>
          </StatusRow>

          <StatusRow label="知識領域">
            <div className="flex flex-wrap gap-1.5">
              {character.knowledgeAreas.map((area) => (
                <span key={area} className="tag-chip tag-chip--static text-xs">{area}</span>
              ))}
            </div>
          </StatusRow>

          <StatusRow label="解放済みトピック">
            <div className="flex flex-wrap gap-1.5">
              {character.unlockedTopics.length > 0 ? (
                character.unlockedTopics.map((topic) => (
                  <span key={topic} className="tag-chip tag-chip--static text-xs">{topic}</span>
                ))
              ) : (
                <span className="text-xs text-[#494949]/50">まだありません</span>
              )}
            </div>
          </StatusRow>
        </div>
      </Modal>
    </>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function AffinityBadge({ value }: { value: number }) {
  return (
    <div className="relative flex items-center justify-center w-9 h-8" aria-label={`親密度 ${value}`}>
      <svg viewBox="0 0 40 36" className="w-full h-full" fill="#fce7f3" aria-hidden="true">
        <path d="M20 33C20 33 3 22 3 12C3 6.5 7.5 2 13 2C16 2 18.5 4 20 6C21.5 4 24 2 27 2C32.5 2 37 6.5 37 12C37 22 20 33 20 33Z" />
      </svg>
      <span className="absolute text-[10px] font-black text-pink-400 leading-none" style={{ marginTop: 2 }}>
        {value}
      </span>
    </div>
  )
}

function StatusRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-black text-[#e77300] uppercase tracking-wide">{label}</span>
      {children}
    </div>
  )
}
