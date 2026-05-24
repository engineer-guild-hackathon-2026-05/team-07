import { CharacterCard } from '../features/components/CharacterCard'
import { EggCard } from '../features/components/EggCard'
import { EggArt } from '../features/components/EggArt'
import { Mascot } from '../features/components/Mascot'
import { Button, Card, EmptyState, Modal, TagInput, TextField } from '../features/components/ui'
import { getEggForCharacter } from '../lib/viewHelpers'
import type { Character, Egg } from '../types/models'

type DevStylePageProps = {
  characters: Character[]
  eggs: Egg[]
}

export function DevStylePage({ characters, eggs }: DevStylePageProps) {
  const character = characters[0]
  const egg = character ? getEggForCharacter(eggs, character) : eggs[0]

  return (
    <div className="screen">
      <Card className="style-hero">
        <p className="eyebrow">ux-06</p>
        <h1>Design System</h1>
        <p>色、余白、radius、shadow、主要コンポーネントの実物を確認するための開発用ページです。</p>
      </Card>

      <Card>
        <h2>Brand Tokens</h2>
        <div className="token-grid">
          <span className="token-swatch token-swatch--orange">orange</span>
          <span className="token-swatch token-swatch--dark">dark</span>
          <span className="token-swatch token-swatch--mint">mint</span>
          <span className="token-swatch token-swatch--surface">surface</span>
        </div>
      </Card>

      <Card>
        <h2>Buttons</h2>
        <div className="button-sample-row">
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
        <h2>Inputs</h2>
        <div className="form-panel">
          <TextField label="TextField" placeholder="偏愛タイトル" />
          <TextField label="Textarea" placeholder="好きの細部を書く" rows={3} multiline />
          <TagInput tags={['ラジオ', '夜']} onChange={() => undefined} />
        </div>
      </Card>

      <Card>
        <h2>Cards</h2>
        <div className="style-card-grid">
          {egg ? <EggCard egg={egg} /> : <EggArt label="たまご" />}
          {character ? <CharacterCard character={character} egg={egg} featured /> : null}
          <EmptyState title="空状態" description="一覧が空のときは理由と次の行動を短く示します。" />
        </div>
      </Card>

      <Card>
        <h2>Mascot</h2>
        <div className="mascot-row">
          <Mascot egg={{ color: '#ffb6d9' }} size="small" />
          <Mascot egg={{ color: '#ffe1a8' }} size="small" />
          <Mascot egg={{ color: '#d9c8ff' }} size="small" />
        </div>
      </Card>

      <Modal isOpen={false} onClose={() => undefined} title="Modal sample">
        <p>このコンポーネントは確認用に定義済みです。</p>
      </Modal>
    </div>
  )
}
