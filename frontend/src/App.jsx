import Landing from './Landing'
import Proofread from './Proofread'
import Translate from './Translate'
import { useState } from 'react'

function getInitialView() {
  const params = new URLSearchParams(window.location.search)
  const v = params.get('view')
  if (v === 'translate' || v === 'proofread') return v
  return 'landing'
}

export default function App() {
  const [view, setView] = useState(getInitialView)

  if (view === 'proofread') {
    return <Proofread onBack={() => setView('landing')} />
  }

  if (view === 'translate') {
    return <Translate onBack={() => setView('landing')} />
  }

  return <Landing setView={setView} />
}
