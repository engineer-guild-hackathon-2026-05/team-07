import type { AppData, Character, Egg, Passion, PassionInput, User } from '../types/models'

const STORAGE_KEY = 'henai-local-mvp-data'

export const CURRENT_USER_ID = 'local-user-m-takahashi'

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

const sampleEgg: Egg = {
  id: 'egg-sample-radio',
  sourceUserUid: CURRENT_USER_ID,
  basedOnPassionIds: [samplePassion.id],
  characterPrompt:
    '深夜ラジオの空気感を大事にする。静かな聞き役で、相手の偏愛の細部を拾って質問する。',
  hatchLevel: 48,
  createdAt: now(),
  currentOwnerUid: CURRENT_USER_ID,
  name: 'ヨルノコ',
  color: '#FF9B37',
  motif: 'fox',
}

const sampleEggBlue: Egg = {
  id: 'egg-sample-cafe',
  sourceUserUid: CURRENT_USER_ID,
  basedOnPassionIds: ['passion-sample-cafe'],
  characterPrompt: 'カフェの香りと静けさを大切にする、のんびりした聞き手。',
  hatchLevel: 62,
  createdAt: now(),
  currentOwnerUid: CURRENT_USER_ID,
  name: 'ソラネ',
  color: '#4EDBFB',
  motif: 'cat',
}

const sampleEggPurple: Egg = {
  id: 'egg-sample-stationery',
  sourceUserUid: CURRENT_USER_ID,
  basedOnPassionIds: ['passion-sample-stationery'],
  characterPrompt: '文房具の手触りや色の組み合わせに詳しい、丁寧な相棒。',
  hatchLevel: 55,
  createdAt: now(),
  currentOwnerUid: CURRENT_USER_ID,
  name: 'ムラサキ',
  color: '#d9c8ff',
  motif: 'bird',
}

const guestGiftEgg: Egg = {
  id: 'egg-guest-gift',
  sourceUserUid: 'guest-user',
  basedOnPassionIds: [guestPassion.id],
  characterPrompt: '旅先の朝市の空気感を大切にする、のんびりした案内役。',
  hatchLevel: 51,
  createdAt: now(),
  currentOwnerUid: 'guest-user',
  name: 'タビトル',
  color: '#d9c8ff',
  motif: 'bird',
}

const sampleCharacter: Character = {
  id: 'character-sample-radio',
  eggId: sampleEgg.id,
  name: 'ヨルノコ',
  personality: '静かに聞き役になりながら、好きの理由をそっと掘り下げる。',
  knowledgeAreas: ['ラジオ番組', '夜更かし文化', '雑談'],
  growthLevel: 2,
  affinityScore: 68,
  unlockedTopics: ['好きになったきっかけ', 'こだわりの専門用語'],
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

const guestGiftCharacter: Character = {
  id: 'character-guest-gift',
  eggId: guestGiftEgg.id,
  name: 'タビトル',
  personality: '旅先の朝の匂いを聞くと、土地の話を少しずつ引き出してくれる。',
  knowledgeAreas: ['旅', '朝', '市場'],
  growthLevel: 1,
  affinityScore: 54,
  unlockedTopics: ['好きな朝の過ごし方', '旅の思い出'],
}

const sampleExchange = {
  id: 'exchange-sample',
  fromUid: 'guest-user',
  toUid: CURRENT_USER_ID,
  eggId: sampleEgg.id,
  createdAt: now(),
  meetingContext: 'ハッカソン会場で交換',
}

const sampleData: AppData = {
  users: [currentUser],
  passions: [samplePassion, guestPassion],
  eggs: [sampleEgg, sampleEggBlue, sampleEggPurple, guestGiftEgg],
  characters: [sampleCharacter, sampleCharacterBlue, sampleCharacterPurple, guestGiftCharacter],
  exchanges: [sampleExchange],
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

export const getCurrentUser = (data: AppData) =>
  data.users.find((user) => user.uid === CURRENT_USER_ID) ?? currentUser

export const getMyPassions = (data: AppData, uid = CURRENT_USER_ID) =>
  data.passions.filter((passion) => passion.ownerUid === uid)

export const getMyEggs = (data: AppData, uid = CURRENT_USER_ID) =>
  data.eggs.filter((egg) => egg.currentOwnerUid === uid)

export const getMyCharacters = (data: AppData, uid = CURRENT_USER_ID) => {
  const myEggIds = new Set(getMyEggs(data, uid).map((egg) => egg.id))
  return data.characters.filter((character) => myEggIds.has(character.eggId))
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

export const appendEggToLocalData = (egg: Egg) => {
  const data = readData()
  const exists = data.eggs.some((item) => item.id === egg.id)
  if (exists) {
    return data
  }

  return writeData({
    ...data,
    eggs: [egg, ...data.eggs],
  })
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
