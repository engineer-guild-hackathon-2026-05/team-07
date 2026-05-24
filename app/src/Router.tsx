import { Routes, Route } from 'react-router-dom'
import App from './App'
import { CharacterDetail } from './pages/CharacterDetail'

export function Router() {
  return (
    <Routes>
      <Route path="/characters/:characterId" element={<CharacterDetail />} />
      {/* Catch-all: existing App handles state-based routing internally */}
      <Route path="/*" element={<App />} />
    </Routes>
  )
}
