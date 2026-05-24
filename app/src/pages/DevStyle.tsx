import { CharacterCard } from '../features/components/CharacterCard'
import { CharacterIllustration } from '../features/components/CharacterIllustration'
import { EggCard } from '../features/components/EggCard'
import { EggArt } from '../features/components/EggArt'
import { Button, Card, EmptyState, Modal, TagInput, Textarea, TextField } from '../components/ui'
import { CHARACTER_SPRITES } from '../lib/characterAssets'
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
          <span className="token-swatch token-swatch--primary">primary</span>
          <span className="token-swatch token-swatch--text">text</span>
          <span className="token-swatch token-swatch--accent">accent</span>
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
          <Textarea label="Textarea" placeholder="好きの細部を書く" rows={3} />
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
        <h2>Character Sprites</h2>
        <div className="mascot-row">
          <CharacterIllustration egg={{ motif: 'fox', color: '#ffb6d9', id: 'ds-pink', name: 'もも' }} size="small" showPedestal />
          <CharacterIllustration egg={{ motif: 'cat', color: '#4EDBFB', id: 'ds-blue', name: 'そら' }} size="small" showPedestal />
          <CharacterIllustration egg={{ motif: 'bird', color: '#d9c8ff', id: 'ds-purple', name: 'ゆめ' }} size="small" showPedestal />
        </div>
        <div className="character-sprite-strip">
          {Object.entries(CHARACTER_SPRITES).map(([key, src]) => (
            <figure className="character-sprite-strip__item" key={key}>
              <img src={src} alt={key} />
              <figcaption>{key}</figcaption>
            </figure>
          ))}
        </div>
      </Card>

      <Modal isOpen={false} onClose={() => undefined} title="Modal sample">
        <p>このコンポーネントは確認用に定義済みです。</p>
      </Modal>
    </div>
  )
}
