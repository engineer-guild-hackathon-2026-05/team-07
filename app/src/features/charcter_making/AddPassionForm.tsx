import type { CSSProperties, FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import type { PassionInput, Visibility } from '../../types/models'

type AddPassionFormProps = {
  onSubmit: (input: PassionInput) => void | Promise<void>
  errorMessage?: string
}

const SUGGESTED_TAGS = ['文房具', '町中華', 'いとうせいこう', 'レトロゲーム', 'コーヒー']

export function AddPassionForm({ onSubmit, errorMessage }: AddPassionFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [tagInput, setTagInput] = useState('')

  const trimmedTitle = title.trim()
  const trimmedDescription = description.trim()
  const canSubmit = trimmedTitle.length > 0 && trimmedDescription.length > 0

  const liveness = Math.min(
    1,
    (trimmedTitle ? 0.25 : 0) +
      (trimmedDescription.length > 8 ? 0.35 : trimmedDescription.length > 0 ? 0.15 : 0) +
      Math.min(0.4, tags.length * 0.1),
  )

  const addTag = (value?: string) => {
    const s = (value ?? tagInput).trim()
    if (!s || tags.length >= 5 || tags.includes(s)) {
      setTagInput('')
      return
    }
    setTags([...tags, s])
    setTagInput('')
  }

  const removeTag = (value: string) => {
    setTags(tags.filter((t) => t !== value))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return

    await onSubmit({
      title: trimmedTitle,
      description: trimmedDescription,
      tags,
      visibility,
    })

    setTitle('')
    setDescription('')
    setTags([])
    setTagInput('')
    setVisibility('public')
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--paper)',
        fontFamily: 'var(--font-body)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Hero band */}
      <HeroBand>
        <StepDots step={0} total={3} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,252,244,0.95)',
              color: 'var(--coral-deep)',
              padding: '4px 12px',
              borderRadius: 999,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: '0.16em',
            }}
          >
            <SparkleIcon size={12} />
            CHAR-01
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 30,
            margin: '8px 0 6px',
            color: '#FFFCF4',
            letterSpacing: '0.01em',
            lineHeight: 1.15,
            textShadow: '0 2px 0 rgba(231,115,0,0.18)',
          }}
        >
          偏愛を、
          <br />
          ことばにする。
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: '#FFF3DC',
            lineHeight: 1.6,
            maxWidth: 240,
          }}
        >
          好きなポイントを書くと、
          <br />
          きみだけの卵とキャラがうまれます。
        </p>
        <HeroSparkles />
      </HeroBand>

      {/* Body */}
      <div
        style={{
          padding: '0 16px 18px',
          marginTop: -28,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <EggPreview liveness={liveness} tagCount={tags.length} />

        <section
          style={{
            background: 'var(--card)',
            borderRadius: 22,
            padding: '18px 18px 18px',
            marginTop: 14,
            boxShadow: '0 6px 18px rgba(80,50,30,0.08), 0 1px 0 rgba(255,255,255,0.6) inset',
            border: '1px solid var(--card-edge)',
          }}
        >
          <Field label="タイトル" icon={<BookmarkIcon />}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 小さな文房具を集めること"
              required
              style={inp()}
            />
          </Field>

          <Field
            label="自由記述"
            icon={<PencilIcon />}
            hint={`${description.length} / 200`}
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="どこが好き？どんな専門用語に反応する？"
              rows={4}
              required
              style={{
                ...inp(),
                resize: 'none',
                minHeight: 96,
                padding: '12px 14px',
                lineHeight: 1.6,
                height: 'auto',
              }}
            />
          </Field>

          <Field label="タグ" icon={<TagIcon />} hint={`${tags.length}/5`}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="例: ラジオ"
                style={{ ...inp(), flex: 1 }}
              />
              <button
                type="button"
                onClick={() => addTag()}
                disabled={tags.length >= 5 || !tagInput.trim()}
                style={{
                  padding: '0 16px',
                  height: 46,
                  borderRadius: 14,
                  background:
                    tagInput.trim() && tags.length < 5
                      ? 'linear-gradient(180deg, #FFA84E, #FF9B37)'
                      : 'var(--paper-deep)',
                  color: tagInput.trim() && tags.length < 5 ? '#FFFCF4' : 'var(--ink-4)',
                  border: 0,
                  fontFamily: 'var(--font-body)',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: tagInput.trim() && tags.length < 5 ? 'pointer' : 'default',
                  boxShadow:
                    tagInput.trim() && tags.length < 5
                      ? '0 4px 10px rgba(255,155,55,0.3)'
                      : 'none',
                  transition: 'all 140ms var(--ease-out)',
                }}
              >
                ＋ 追加
              </button>
            </div>

            {tags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {tags.map((t, i) => (
                  <TagChip key={t} text={t} idx={i} onRemove={() => removeTag(t)} />
                ))}
              </div>
            ) : null}

            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 10, marginBottom: 6 }}>
              よく使われるタグ
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTED_TAGS.filter((s) => !tags.includes(s))
                .slice(0, 4)
                .map((s) => (
                  <SuggestChip key={s} text={s} onPick={() => addTag(s)} />
                ))}
            </div>
          </Field>

          <Field label="公開範囲" icon={<GlobeIcon />} last>
            <VisibilityToggle value={visibility} onChange={setVisibility} />
          </Field>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              height: 58,
              marginTop: 22,
              borderRadius: 18,
              background: canSubmit
                ? 'linear-gradient(180deg, #FFA84E 0%, #FF9B37 60%, #FB8E1F 100%)'
                : 'var(--paper-deep)',
              color: canSubmit ? '#FFFCF4' : 'var(--ink-4)',
              border: 0,
              fontFamily: 'var(--font-body)',
              fontWeight: 800,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: canSubmit
                ? '0 10px 28px rgba(255,155,55,0.45), 0 2px 0 rgba(231,115,0,0.35), 0 1px 0 rgba(255,255,255,0.5) inset'
                : 'none',
              cursor: canSubmit ? 'pointer' : 'default',
              transition: 'all 140ms var(--ease-out)',
            }}
          >
            <SparkleIcon size={18} />
            AIチャットで深掘り
            <CaretRightIcon size={14} />
          </button>
          <p
            style={{
              textAlign: 'center',
              margin: '10px 0 0',
              fontSize: 11,
              color: 'var(--ink-3)',
            }}
          >
            AI が会話で性格と見た目を整えてくれます
          </p>
          {errorMessage ? (
            <p
              style={{
                textAlign: 'center',
                marginTop: 10,
                fontSize: 12,
                fontWeight: 700,
                color: '#c2410c',
              }}
            >
              {errorMessage}
            </p>
          ) : null}
        </section>
      </div>
    </form>
  )
}

// === Subcomponents ===

function HeroBand({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #FFB35F 0%, #FF9B37 55%, #E77300 100%)',
        padding: '18px 22px 44px',
        borderRadius: '0 0 32px 32px',
        color: '#FFFCF4',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

function HeroSparkles() {
  return (
    <svg
      viewBox="0 0 360 200"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.7,
      }}
    >
      <g fill="#FFFCF4">
        <SVGSparkle cx={280} cy={36} r={10} />
        <SVGSparkle cx={310} cy={92} r={6} />
        <SVGSparkle cx={250} cy={120} r={8} />
        <SVGSparkle cx={336} cy={150} r={5} />
        <SVGSparkle cx={210} cy={26} r={5} />
      </g>
    </svg>
  )
}

function SVGSparkle({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <path
      d={`M${cx} ${cy - r} L${cx + r * 0.35} ${cy - r * 0.35} L${cx + r} ${cy} L${cx + r * 0.35} ${cy + r * 0.35} L${cx} ${cy + r} L${cx - r * 0.35} ${cy + r * 0.35} L${cx - r} ${cy} L${cx - r * 0.35} ${cy - r * 0.35} Z`}
      opacity="0.85"
    />
  )
}

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 6,
        alignItems: 'center',
        background: 'rgba(255,252,244,0.18)',
        padding: '4px 10px',
        borderRadius: 999,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          style={{
            width: i === step ? 18 : 6,
            height: 6,
            borderRadius: 999,
            background: i === step ? '#FFFCF4' : 'rgba(255,252,244,0.5)',
            transition: 'width 220ms var(--ease-out)',
          }}
        />
      ))}
      <span
        style={{
          marginLeft: 4,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: '#FFFCF4',
        }}
      >
        STEP {step + 1} / {total}
      </span>
    </div>
  )
}

function EggPreview({ liveness, tagCount }: { liveness: number; tagCount: number }) {
  const stage: 'cold' | 'warm' | 'alive' = liveness < 0.25 ? 'cold' : liveness < 0.65 ? 'warm' : 'alive'
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #FFFCF4 0%, #FFF3DC 100%)',
        borderRadius: 22,
        padding: '14px 16px 16px',
        boxShadow: '0 8px 20px rgba(80,50,30,0.10), 0 1px 0 rgba(255,255,255,0.7) inset',
        border: '1px solid var(--card-edge)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 50% 35%, #FFFCF4, #FFE9D2 65%, #FFD2A1 100%)',
          boxShadow:
            'inset 0 -6px 14px rgba(231,115,0,0.18), inset 0 8px 14px rgba(255,255,255,0.7), 0 6px 14px rgba(80,50,30,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <EggOrChar stage={stage} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: 'var(--coral-deep)',
              letterSpacing: '0.16em',
            }}
          >
            PREVIEW
          </span>
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>· リアルタイムでうごく</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--ink)',
            marginBottom: 6,
          }}
        >
          {stage === 'cold' && 'まだ、たまごの中…'}
          {stage === 'warm' && 'すこし、うごいた'}
          {stage === 'alive' && 'こんにちは！'}
        </div>
        <div
          style={{
            width: '100%',
            height: 6,
            borderRadius: 999,
            background: '#FFE3C8',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${liveness * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #FFD2A1, #FF9B37 70%, #17BFE4 100%)',
              borderRadius: 999,
              transition: 'width 420ms var(--ease-out)',
            }}
          />
        </div>
        <div style={{ fontSize: 10.5, color: 'var(--ink-3)', marginTop: 5 }}>
          {tagCount > 0 ? `タグ ${tagCount}/5 が反映中` : '入力するほど、輪郭がはっきりする'}
        </div>
      </div>
    </div>
  )
}

function EggOrChar({ stage }: { stage: 'cold' | 'warm' | 'alive' }) {
  if (stage === 'cold') {
    return (
      <svg width="58" height="58" viewBox="0 0 60 60">
        <ellipse cx="30" cy="35" rx="20" ry="24" fill="#FFE9D2" />
        <ellipse cx="23" cy="28" rx="6" ry="9" fill="#FFFCF4" opacity="0.55" />
      </svg>
    )
  }
  if (stage === 'warm') {
    return (
      <svg width="62" height="62" viewBox="0 0 60 60">
        <ellipse cx="30" cy="35" rx="22" ry="24" fill="#FFD2A1" />
        <path
          d="M14 30 Q 18 27 22 30"
          stroke="#9B3F30"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M38 30 Q 42 27 46 30"
          stroke="#9B3F30"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse cx="22" cy="36" rx="3" ry="2" fill="#FF9B37" opacity="0.45" />
        <ellipse cx="38" cy="36" rx="3" ry="2" fill="#FF9B37" opacity="0.45" />
      </svg>
    )
  }
  return (
    <svg width="68" height="68" viewBox="0 0 60 60">
      <ellipse cx="30" cy="34" rx="22" ry="22" fill="#F8B7A8" />
      <ellipse cx="22" cy="32" rx="2" ry="2.6" fill="#1B3A4A" />
      <ellipse cx="38" cy="32" rx="2" ry="2.6" fill="#1B3A4A" />
      <path
        d="M24 40 Q 30 44 36 40"
        stroke="#1B3A4A"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="18" cy="38" rx="2.4" ry="1.4" fill="#FF9B37" opacity="0.45" />
      <ellipse cx="42" cy="38" rx="2.4" ry="1.4" fill="#FF9B37" opacity="0.45" />
    </svg>
  )
}

const TAG_PALETTE = [
  { bg: 'var(--coral-wash)', fg: 'var(--coral-deep)' },
  { bg: 'var(--honey-wash)', fg: 'var(--honey-deep)' },
  { bg: 'var(--sky-wash)', fg: '#0E91AE' },
  { bg: 'var(--sage-wash)', fg: 'var(--sage-deep)' },
  { bg: 'var(--plum-wash)', fg: 'var(--plum-deep)' },
]

function TagChip({ text, idx, onRemove }: { text: string; idx: number; onRemove: () => void }) {
  const c = TAG_PALETTE[idx % TAG_PALETTE.length]
  return (
    <button
      type="button"
      onClick={onRemove}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 8px 5px 12px',
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        border: 0,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset',
      }}
    >
      #{text}
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.06)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          marginLeft: 2,
        }}
      >
        ✕
      </span>
    </button>
  )
}

function SuggestChip({ text, onPick }: { text: string; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 12px',
        borderRadius: 999,
        background: 'var(--card)',
        color: 'var(--ink-2)',
        border: '1px dashed var(--card-edge)',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      ＋ {text}
    </button>
  )
}

function VisibilityToggle({
  value,
  onChange,
}: {
  value: Visibility
  onChange: (v: Visibility) => void
}) {
  const items: { id: Visibility; label: string; icon: ReactNode }[] = [
    { id: 'public', label: '公開', icon: <GlobeIcon /> },
    { id: 'friends', label: 'フレンド', icon: <UsersIcon /> },
    { id: 'private', label: '非公開', icon: <LockIcon /> },
  ]
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 4,
        background: 'var(--coral-wash)',
        padding: 4,
        borderRadius: 16,
      }}
    >
      {items.map((it) => {
        const active = it.id === value
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => onChange(it.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '9px 4px',
              borderRadius: 12,
              border: 0,
              background: active ? 'var(--card)' : 'transparent',
              color: active ? 'var(--coral-deep)' : 'var(--ink-3)',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 12,
              boxShadow: active ? '0 2px 6px rgba(80,50,30,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 140ms var(--ease-out)',
            }}
          >
            {it.icon}
            {it.label}
          </button>
        )
      })}
    </div>
  )
}

function Field({
  label,
  icon,
  hint,
  last,
  children,
}: {
  label: string
  icon?: ReactNode
  hint?: string
  last?: boolean
  children: ReactNode
}) {
  return (
    <div style={{ marginBottom: last ? 0 : 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 800,
            color: 'var(--ink)',
          }}
        >
          {icon ? <span style={{ color: 'var(--coral-deep)', display: 'inline-flex' }}>{icon}</span> : null}
          {label}
        </div>
        {hint ? <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{hint}</span> : null}
      </div>
      {children}
    </div>
  )
}

function inp(): CSSProperties {
  return {
    width: '100%',
    height: 46,
    boxSizing: 'border-box',
    background: 'var(--card)',
    border: '1.5px solid var(--card-edge)',
    borderRadius: 14,
    padding: '0 14px',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--ink)',
    outline: 'none',
    transition: 'all 140ms var(--ease-out)',
  }
}

// === Inline icons (replaces phosphor-icons from mock) ===

function SparkleIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2z" />
    </svg>
  )
}
function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41L13 21a2 2 0 0 1-2.83 0L2 12.83V4a2 2 0 0 1 2-2h8.83l7.76 7.76a2 2 0 0 1 0 2.83z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
function CaretRightIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
