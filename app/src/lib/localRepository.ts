import type { AppData, Character, Egg, Passion, PassionInput, User } from '../types/models'

export const STORAGE_KEY = 'henai-local-mvp-data'

export const CURRENT_USER_ID = 'local-user-m-takahashi'

/** 会場デモ用: 交換タブから受け取るサンプル卵（偏愛登録なしで用意済み） */
export const DEMO_RECEIVABLE_EGG_ID = 'egg-guest-gift'

/** デモ/ローカル: 1 回の会話で増える孵化進捗（%） */
export const HATCH_PROGRESS_PER_MESSAGE = 15

export const HATCH_COMPLETE_LEVEL = 100

const now = () => new Date().toISOString()

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}`
}

const currentUser: User = {
  uid: CURRENT_USER_ID,
  name: 'm.takahashi',
  createdAt: now(),
  favoriteTags: ['カフェ巡り', '深夜ラジオ', '文房具'],
}

const samplePassion: Passion = {
  id: 'passion-sample-radio',
  ownerUid: CURRENT_USER_ID,
  title: '深夜ラジオの空気感',
  description:
    '知らない誰かの生活音や、話し手の小さなこだわりが、夜の時間にだけ少し近く感じられるところが好き。',
  tags: ['ラジオ', '夜', '雑談'],
  createdAt: now(),
  visibility: 'public',
}

const guestPassion: Passion = {
  id: 'passion-guest-travel',
  ownerUid: 'guest-user',
  title: '旅先の朝市',
  description: '土地の人の会話と、朝の匂いがセットで好き。',
  tags: ['旅', '朝', '市場'],
  createdAt: now(),
  visibility: 'public',
}

/** デモ/本番共通: 交換で受け取れるサンプル卵（初期所有者は guest） */
const demoReceivableEgg: Egg = {
  id: DEMO_RECEIVABLE_EGG_ID,
  sourceUserUid: 'guest-user',
  basedOnPassionIds: [guestPassion.id],
  characterPrompt: '旅先の朝市の空気感を大切にする、のんびりした案内役。',
  hatchLevel: 12,
  createdAt: now(),
  currentOwnerUid: 'guest-user',
  name: 'タビトル',
  color: '#d9c8ff',
  motif: 'egg',
}

/** 他ユーザーが渡す用のサンプル卵（デモユーザーは初期状態では未所持） */
const demoShareEgg: Egg = {
  id: 'egg-demo-share',
  sourceUserUid: 'guest-user',
  basedOnPassionIds: [samplePassion.id],
  characterPrompt:
    '深夜ラジオの空気感を大事にする。静かな聞き役で、相手の偏愛の細部を拾って質問する。',
  hatchLevel: 48,
  createdAt: now(),
  currentOwnerUid: 'guest-user',
  name: 'ヨルノコ',
  color: '#FF9B37',
  motif: 'fox',
}

const sampleEggBlue: Egg = {
  id: 'egg-sample-cafe',
  sourceUserUid: 'guest-user',
  basedOnPassionIds: ['passion-sample-cafe'],
  characterPrompt: 'カフェの香りと静けさを大切にする、のんびりした聞き手。',
  hatchLevel: 62,
  createdAt: now(),
  currentOwnerUid: 'guest-user',
  name: 'ソラネ',
  color: '#4EDBFB',
  motif: 'cat',
}

const sampleEggPurple: Egg = {
  id: 'egg-sample-stationery',
  sourceUserUid: 'guest-user',
  basedOnPassionIds: ['passion-sample-stationery'],
  characterPrompt: '文房具の手触りや色の組み合わせに詳しい、丁寧な相棒。',
  hatchLevel: 55,
  createdAt: now(),
  currentOwnerUid: 'guest-user',
  name: 'ムラサキ',
  color: '#d9c8ff',
  motif: 'bird',
}

const sampleCharacterBlue: Character = {
  id: 'character-sample-cafe',
  eggId: sampleEggBlue.id,
  name: 'ソラネ',
  personality: 'カフェの空気感を言葉にして、落ち着いた会話を重ねる。',
  knowledgeAreas: ['カフェ', 'コーヒー', '読書'],
  growthLevel: 3,
  affinityScore: 74,
  unlockedTopics: ['お気に入りの席', '香りのこだわり'],
}

const sampleCharacterPurple: Character = {
  id: 'character-sample-stationery',
  eggId: sampleEggPurple.id,
  name: 'ムラサキ',
  personality: '文房具の細部に目が行き、こだわりを一つずつ拾い上げる。',
  knowledgeAreas: ['文房具', 'ノート', 'ペン'],
  growthLevel: 2,
  affinityScore: 61,
  unlockedTopics: ['最初に惹かれた一点', '手触りの好み'],
}

const sampleData: AppData = {
  // デモ: ログイン時は卵未所持 → 育成=空画面。交換/読み取る → タビトル受取 → 育成へ。
  users: [currentUser],
  passions: [samplePassion, guestPassion],
  eggs: [demoReceivableEgg, demoShareEgg, sampleEggBlue, sampleEggPurple],
  characters: [sampleCharacterBlue, sampleCharacterPurple],
  exchanges: [],
  chats: [],
}

const readData = (): AppData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return sampleData
    }

    const parsed = JSON.parse(saved) as Partial<AppData>
    if (
      !Array.isArray(parsed.users) ||
      !Array.isArray(parsed.passions) ||
      !Array.isArray(parsed.eggs) ||
      !Array.isArray(parsed.characters)
    ) {
      return sampleData
    }

    return {
      users: parsed.users,
      passions: parsed.passions,
      eggs: parsed.eggs,
      characters: parsed.characters,
      exchanges: Array.isArray(parsed.exchanges) ? parsed.exchanges : [],
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
    }
  } catch {
    return sampleData
  }
}

const writeData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return data
}

export const loadAppData = () => readData()

export const resetDemoData = () => writeData(sampleData)

export const hasChatHistoryForEgg = (eggId: string, userId: string): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return false
    }
    const data = JSON.parse(raw) as { chats?: Array<{ characterId?: string; userUid?: string; messages?: unknown[] }> }
    return (
      Array.isArray(data.chats) &&
      data.chats.some(
        (chat) =>
          chat.characterId === eggId &&
          chat.userUid === userId &&
          Array.isArray(chat.messages) &&
          chat.messages.length > 0,
      )
    )
  } catch {
    return false
  }
}

export const getCurrentUser = (data: AppData) =>
  data.users.find((user) => user.uid === CURRENT_USER_ID) ?? currentUser

export const getMyPassions = (data: AppData, uid = CURRENT_USER_ID) =>
  data.passions.filter((passion) => passion.ownerUid === uid)

export const getMyEggs = (data: AppData, uid = CURRENT_USER_ID) =>
  data.eggs.filter((egg) => egg.currentOwnerUid === uid)

export const getMyCharacters = (data: AppData, uid = CURRENT_USER_ID) => {
  const myEggIds = new Set(getMyEggs(data, uid).map((egg) => egg.id))
  return data.characters.filter(
    (character) => myEggIds.has(character.eggId) && character.id === character.eggId,
  )
}

export const createLocalEggFromPassion = (passion: Passion): Egg => {
  const seed = `${passion.title}${passion.description}${passion.tags.join('')}`
  const score = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const names = ['コダワリス', 'スキノメ', 'ハマリット', 'ネツタマ', 'ピントン']
  const colors = ['#FF9B37', '#4EDBFB', '#E77300', '#ffb6d9']
  const motifs: Egg['motif'][] = ['fox', 'cat', 'bird', 'egg']

  return {
    id: createId('egg'),
    sourceUserUid: passion.ownerUid,
    basedOnPassionIds: [passion.id],
    characterPrompt: `${passion.title}への偏愛から生まれたキャラクター。好きな理由: ${passion.description}`,
    hatchLevel: Math.max(24, Math.min(94, Math.round(passion.description.length * 1.3 + passion.tags.length * 10))),
    createdAt: now(),
    currentOwnerUid: passion.ownerUid,
    name: names[score % names.length],
    color: colors[score % colors.length],
    motif: motifs[score % motifs.length],
  }
}

const createCharacterFromEgg = (egg: Egg, passion: Passion): Character => ({
  id: createId('character'),
  eggId: egg.id,
  name: egg.name,
  personality: '偏愛の専門用語を聞くと喜び、相手のこだわりを覚えて少しずつ懐いていく。',
  knowledgeAreas: passion.tags.length > 0 ? passion.tags : ['偏愛'],
  growthLevel: Math.max(1, Math.round(egg.hatchLevel / 28)),
  affinityScore: Math.min(95, egg.hatchLevel + 12),
  unlockedTopics: ['好きになったきっかけ', '一番語りたい細部'],
})

export const createPassion = (input: PassionInput, uid = CURRENT_USER_ID) => {
  const data = readData()
  const passion: Passion = {
    id: createId('passion'),
    ownerUid: uid,
    title: input.title,
    description: input.description,
    tags: input.tags,
    createdAt: now(),
    visibility: input.visibility,
  }
  const egg = createLocalEggFromPassion(passion)
  const character = createCharacterFromEgg(egg, passion)

  return writeData({
    ...data,
    passions: [passion, ...data.passions],
    eggs: [egg, ...data.eggs],
    characters: [character, ...data.characters],
  })
}

export const mergeEggsIntoAppData = (data: AppData, incoming: Egg[]): AppData => {
  if (incoming.length === 0) {
    return data
  }

  const byId = new Map(data.eggs.map((egg) => [egg.id, egg]))
  for (const egg of incoming) {
    byId.set(egg.id, egg)
  }

  return {
    ...data,
    eggs: Array.from(byId.values()),
  }
}

export const appendEggToLocalData = (egg: Egg) => {
  const data = readData()
  return writeData(mergeEggsIntoAppData(data, [egg]))
}

export const syncEggsToLocalData = (eggs: Egg[]) => {
  const data = readData()
  return writeData(mergeEggsIntoAppData(data, eggs))
}

export type HatchProgressResult = {
  data: AppData
  hatched: boolean
  hatchLevel: number
}

const hatchCharacterFromEgg = (egg: Egg, passion?: Passion): Character => ({
  id: egg.id,
  eggId: egg.id,
  name: egg.name,
  personality: egg.characterPrompt,
  knowledgeAreas: passion && passion.tags.length > 0 ? passion.tags : ['偏愛'],
  growthLevel: 1,
  affinityScore: 20,
  unlockedTopics: passion
    ? [passion.title, '好きになったきっかけ']
    : ['好きになったきっかけ', '一番語りたい細部'],
})

/** デモ/ローカル: 会話 1 回ごとに孵化を進め、100% で characters に永続化する */
export const advanceLocalHatchProgress = (eggId: string, ownerUid: string): HatchProgressResult | null => {
  const data = readData()
  const eggIndex = data.eggs.findIndex((item) => item.id === eggId && item.currentOwnerUid === ownerUid)
  if (eggIndex < 0) {
    return null
  }

  const egg = data.eggs[eggIndex]
  const alreadyHatched = data.characters.some((character) => character.id === eggId && character.eggId === eggId)
  if (alreadyHatched) {
    return { data, hatched: true, hatchLevel: egg.hatchLevel }
  }

  const hatchLevel = Math.min(HATCH_COMPLETE_LEVEL, egg.hatchLevel + HATCH_PROGRESS_PER_MESSAGE)
  const eggs = data.eggs.map((item, index) => (index === eggIndex ? { ...item, hatchLevel } : item))
  const hatched = hatchLevel >= HATCH_COMPLETE_LEVEL

  const characters = hatched
    ? [hatchCharacterFromEgg(eggs[eggIndex], data.passions.find((p) => egg.basedOnPassionIds.includes(p.id))), ...data.characters]
    : data.characters

  const nextData = writeData({
    ...data,
    eggs,
    characters,
  })

  return { data: nextData, hatched, hatchLevel }
}

export const receiveEggLocally = (eggId: string, toUid: string, meetingContext: string) => {
  const data = readData()
  const egg = data.eggs.find((item) => item.id === eggId)

  if (!egg) {
    return null
  }

  if (egg.currentOwnerUid === toUid) {
    return data
  }

  const exchange = {
    id: createId('exchange'),
    fromUid: egg.currentOwnerUid,
    toUid,
    eggId,
    createdAt: now(),
    meetingContext,
  }

  const eggs = data.eggs.map((item) =>
    item.id === eggId ? { ...item, currentOwnerUid: toUid } : item,
  )

  return writeData({
    ...data,
    eggs,
    exchanges: [exchange, ...data.exchanges],
  })
}
