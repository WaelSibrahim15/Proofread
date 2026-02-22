const BASE = ''

export async function fetchLanguages() {
  const r = await fetch(`${BASE}/api/languages`)
  if (!r.ok) throw new Error(`Failed to load languages: ${r.status}`)
  return r.json()
}

export async function checkText(text, language) {
  const r = await fetch(`${BASE}/api/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language }),
  })
  if (!r.ok) throw new Error(`Check failed: ${r.status}`)
  return r.json()
}
