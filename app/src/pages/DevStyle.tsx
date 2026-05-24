import { CharacterCard } from '../features/components/CharacterCard'
import { EggCard } from '../features/components/EggCard'
import { EggArt } from '../features/components/EggArt'
import { Mascot } from '../features/components/Mascot'
import { Button, Card, EmptyState, Modal, TagInput, Textarea, TextField } from '../components/ui'
import { getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg } from '../types/models'

const screenClasses =
  'h-full overflow-y-auto box-border px-[22px] pt-7 pb-28 flex flex-col gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

type DevStylePageProps = {
  characters: Character[]
  eggs: Egg[]
}

export function DevStylePage({ characters, eggs }: DevStylePageProps) {
  const character = characters[0]
  const egg = character ? getEggForCharacter(eggs, character) : eggs[0]

  return (
    <div className={screenClasses}>
      <Card className="grid gap-2">
        <p className="text-orange-dark text-xs font-extrabold uppercase tracking-wider">ux-06</p>
        <h1 className="text-text-h">Design System</h1>
        <p className="text-text">色、余白、radius、shadow、主要コンポーネントの実物を確認するための開発用ページです。</p>
      </Card>

      <Card>
        <h2 className="text-text-h mb-3">Brand Tokens</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <span className="grid place-items-center min-h-[74px] rounded-md text-white font-black bg-orange">orange</span>
          <span className="grid place-items-center min-h-[74px] rounded-md text-white font-black bg-text-h">dark</span>
          <span className="grid place-items-center min-h-[74px] rounded-md text-white font-black bg-mint">mint</span>
          <span className="grid place-items-center min-h-[74px] rounded-md text-text-h font-black border border-border bg-surface">
            surface
          </span>
        </div>
      </Card>

      <Card>
        <h2 className="text-text-h mb-3">Typography</h2>
        <div className="grid gap-2">
          <p className="text-caption text-orange-dark font-extrabold uppercase tracking-wider">caption / eyebrow</p>
          <p className="text-body-sm text-text">body-sm: 補足説明やカード内の短い説明に使います。</p>
          <p className="text-body text-text">body: 画面間で共通の本文サイズです。</p>
          <p className="text-title text-text-h font-black">title: セクションや主要見出し</p>
          <p className="text-display text-text-h font-black">display: ランディングや強い見出し</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-text-h mb-3">Buttons</h2>
        <div className="grid gap-2.5">
          <Button type="button">Primary</Button>
          <Button type="button" variant="secondary">
            Secondary
          </Button>
          <Button type="button" variant="ghost">
            Ghost
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-text-h mb-3">Inputs</h2>
        <div className="grid gap-[18px]">
          <TextField label="TextField" placeholder="偏愛タイトル" />
          <Textarea label="Textarea" placeholder="好きの細部を書く" rows={3} />
          <TagInput tags={['ラジオ', '夜']} onChange={() => undefined} />
        </div>
      </Card>

      <Card>
        <h2 className="text-text-h mb-3">Cards</h2>
        <div className="grid gap-3.5">
          {egg ? <EggCard egg={egg} /> : <EggArt label="たまご" />}
          {character ? <CharacterCard character={character} egg={egg} featured /> : null}
          <EmptyState title="空状態" description="一覧が空のときは理由と次の行動を短く示します。" />
        </div>
      </Card>

      <Card>
        <h2 className="text-text-h mb-3">Mascot</h2>
        <div className="grid grid-cols-3 items-end gap-2.5 [&_.mascot]:scale-75 [&_.mascot]:origin-bottom">
          <Mascot egg={{ color: '#ffb6d9' }} size="small" />
          <Mascot egg={{ color: '#ffe1a8' }} size="small" />
          <Mascot egg={{ color: '#d9c8ff' }} size="small" />
        </div>
      </Card>

      <Modal isOpen={false} onClose={() => undefined} title="Modal sample">
        <p className="text-text">このコンポーネントは確認用に定義済みです。</p>
      </Modal>
    </div>
  )
}
