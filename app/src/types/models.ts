export type Visibility = 'public' | 'friends' | 'private'

export type AppRoute = 'home' | 'add' | 'exchange' | 'grow' | 'profile'

export type User = {
  uid: string
  name: string
  iconUrl?: string
  createdAt: string
  favoriteTags: string[]
}

export type Passion = {
  id: string
  ownerUid: string
  title: string
  description: string
  tags: string[]
  createdAt: string
  visibility: Visibility
}

export type Egg = {
  id: string
  sourceUserUid: string
  basedOnPassionIds: string[]
  characterPrompt: string
  hatchLevel: number
  createdAt: string
  currentOwnerUid: string
  name: string
  color: string
  motif: 'egg' | 'fox' | 'cat' | 'bird'
}

export type Character = {
  id: string
  eggId: string
  name: string
  personality: string
  knowledgeAreas: string[]
  growthLevel: number
  affinityScore: number
  unlockedTopics: string[]
}

export type Exchange = {
  id: string
  fromUid: string
  toUid: string
  eggId: string
  createdAt: string
  meetingContext: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'character'
  content: string
  createdAt: string
}

export type Chat = {
  id: string
  characterId: string
  userUid: string
  messages: ChatMessage[]
  updatedAt: string
}

export type PassionInput = {
  title: string
  description: string
  tags: string[]
  visibility: Visibility
}

export type AppData = {
  users: User[]
  passions: Passion[]
  eggs: Egg[]
  characters: Character[]
  exchanges: Exchange[]
  chats: Chat[]
  /** uid → 育成画面にセッティング済みの eggId 一覧 */
  nurturingEggIdsByUid?: Record<string, string[]>
}
