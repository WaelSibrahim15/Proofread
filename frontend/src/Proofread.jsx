import { useCallback, useEffect, useRef, useState } from 'react'
import { checkText, fetchLanguages } from './api.js'

const DEBOUNCE_MS = 700
const PLACEHOLDER = 'Start typing or paste your text here to check for grammar and spelling errors…'

// Color scheme for match types
function matchColor(type) {
  switch (type?.typeName) {
    case 'UnknownWord':
    case 'misspelling':
      return 'spell'
    case 'Other':
    case 'grammar':
      return 'grammar'
    case 'typographical':
      return 'typo'
    case 'style':
    case 'locale-violation':
    case 'register':
      return 'style'
    default:
      return 'grammar'
  }
}

// Build HTML with <mark> spans from plain text + matches
function buildHighlightedHtml(text, matches) {
  if (!matches || matches.length === 0) return escapeHtml(text).replace(/\n/g, '<br>')

  // Sort by offset, deduplicate overlaps
  const sorted = [...matches].sort((a, b) => a.offset - b.offset)
  const deduped = []
  let last = -1
  for (const m of sorted) {
    if (m.offset >= last) {
      deduped.push(m)
      last = m.offset + m.length
    }
  }

  let html = ''
  let pos = 0
  for (const m of deduped) {
    if (m.offset > pos) {
      html += escapeHtml(text.slice(pos, m.offset)).replace(/\n/g, '<br>')
    }
    const cls = matchColor(m.rule?.issueType ? { typeName: m.rule.issueType } : m.type)
    const title = escapeAttr(m.message || '')
    const idx = deduped.indexOf(m)
    html += `<mark class="lt-mark lt-${cls}" data-idx="${idx}" title="${title}">${escapeHtml(text.slice(m.offset, m.offset + m.length)).replace(/\n/g, '<br>')}</mark>`
    pos = m.offset + m.length
  }
  if (pos < text.length) {
    html += escapeHtml(text.slice(pos)).replace(/\n/g, '<br>')
  }
  return html
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function wordCount(text) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

export default function Proofread({ onBack }) {
  const [text, setText] = useState('')
  const [matches, setMatches] = useState([])
  const [languages, setLanguages] = useState([])
  const [language, setLanguage] = useState('en-US')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState(null)
  const [popover, setPopover] = useState(null) // { match, x, y }
  const [ltReady, setLtReady] = useState(false)

  const textareaRef = useRef(null)
  const overlayRef = useRef(null)
  const debounceRef = useRef(null)
  const popoverRef = useRef(null)

  // Load languages on mount, poll until LT is ready
  useEffect(() => {
    let cancelled = false
    async function tryLoad() {
      for (let i = 0; i < 60; i++) {
        if (cancelled) return
        try {
          const langs = await fetchLanguages()
          if (cancelled) return
          const sorted = [...langs].sort((a, b) => a.name.localeCompare(b.name))
          setLanguages(sorted)
          setLtReady(true)
          return
        } catch {
          await new Promise(r => setTimeout(r, 2000))
        }
      }
    }
    tryLoad()
    return () => { cancelled = true }
  }, [])

  // Sync overlay scroll with textarea scroll
  const syncScroll = useCallback(() => {
    if (overlayRef.current && textareaRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  // Run grammar check
  const runCheck = useCallback(async (value, lang) => {
    if (!value.trim()) {
      setMatches([])
      setChecking(false)
      return
    }
    setChecking(true)
    setError(null)
    try {
      const result = await checkText(value, lang)
      setMatches(result.matches || [])
    } catch (e) {
      setError('Could not reach the grammar checker. Is the server running?')
    } finally {
      setChecking(false)
    }
  }, [])

  // Debounce text changes
  const handleChange = useCallback((e) => {
    const value = e.target.value
    setText(value)
    setPopover(null)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runCheck(value, language), DEBOUNCE_MS)
  }, [language, runCheck])

  // Re-run when language changes
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runCheck(text, language), DEBOUNCE_MS)
  }, [language]) // eslint-disable-line

  // Update overlay HTML whenever text or matches change
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.innerHTML = text
        ? buildHighlightedHtml(text, matches)
        : `<span class="placeholder">${PLACEHOLDER}</span>`
    }
  }, [text, matches])

  // Handle click on highlighted marks
  const handleOverlayClick = useCallback((e) => {
    const mark = e.target.closest('[data-idx]')
    if (!mark) {
      setPopover(null)
      return
    }
    const idx = parseInt(mark.dataset.idx, 10)
    const m = matches[idx]
    if (!m) return
    const rect = mark.getBoundingClientRect()
    setPopover({ match: m, idx, x: rect.left, y: rect.bottom + 6 })
  }, [matches])

  // Close popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopover(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Apply a replacement suggestion
  const applyReplacement = useCallback((replacement) => {
    if (!popover) return
    const { match } = popover
    const before = text.slice(0, match.offset)
    const after = text.slice(match.offset + match.length)
    const newText = before + replacement + after
    setText(newText)
    setPopover(null)
    // Re-check immediately
    clearTimeout(debounceRef.current)
    runCheck(newText, language)
  }, [popover, text, language, runCheck])

  const errorCount = matches.filter(m => {
    const t = m.rule?.issueType || m.type?.typeName || ''
    return t === 'grammar' || t === 'misspelling' || t === 'UnknownWord'
  }).length
  const warnCount = matches.length - errorCount

  return (
    <div className="app">
      <header className="header" style={{ background: '#eeeef5', borderBottom: '1px solid #d0d0de' }}>
        <div className="header-left">
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#606080', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            ← Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <svg viewBox="0 0 40 40" fill="none" style={{ width: '20px', height: '20px' }}>
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#1a3a6b" />
                  <stop offset="100%" stopColor="#2a5298" />
                </linearGradient>
              </defs>
              <rect width="40" height="40" rx="10" fill="url(#lg)" />
              <line x1="7" y1="11" x2="22" y2="11" stroke="#e8620a" strokeWidth="3" strokeLinecap="round" />
              <line x1="14.5" y1="11" x2="14.5" y2="30" stroke="#e8620a" strokeWidth="3" strokeLinecap="round" />
              <path d="M34,13 A10,10 0 0,0 34,28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="33" cy="33" r="2.5" fill="#e8620a" opacity="0.85" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.01em', color: '#1a1a2e' }}>
              <span style={{ color: '#1a3a6b' }}>Trans</span><span style={{ color: '#e8620a' }}>Craft</span><span style={{ color: '#9090a8', fontWeight: 400, marginLeft: '3px' }}>Proofread</span>
            </span>
          </div>
        </div>
        <div className="header-right">
          {!ltReady && (
            <span className="lt-loading">
              <span className="spinner-small" />
              Starting grammar engine…
            </span>
          )}
          <select
            className="lang-select"
            value={language}
            onChange={e => setLanguage(e.target.value)}
            disabled={!ltReady}
          >
            {languages.length === 0 && <option value="en-US">English (US)</option>}
            {languages.map(l => (
              <option key={l.longCode || l.code} value={l.longCode || l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="main">
        <div className="editor-wrap">
          {/* Highlight overlay — sits behind textarea */}
          <div
            ref={overlayRef}
            className="overlay"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />
          {/* Invisible textarea on top for input */}
          <textarea
            ref={textareaRef}
            className="editor"
            value={text}
            onChange={handleChange}
            onScroll={syncScroll}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={PLACEHOLDER}
          />
        </div>

        {/* Suggestion popover */}
        {popover && (
          <div
            ref={popoverRef}
            className="popover"
            style={{ top: popover.y, left: Math.min(popover.x, window.innerWidth - 340) }}
          >
            <div className="popover-message">{popover.match.message}</div>
            {popover.match.shortMessage && popover.match.shortMessage !== popover.match.message && (
              <div className="popover-short">{popover.match.shortMessage}</div>
            )}
            {popover.match.replacements?.length > 0 && (
              <div className="popover-suggestions">
                {popover.match.replacements.slice(0, 5).map((r, i) => (
                  <button
                    key={i}
                    className="suggestion-btn"
                    onClick={() => applyReplacement(r.value)}
                  >
                    {r.value}
                  </button>
                ))}
              </div>
            )}
            <button className="dismiss-btn" onClick={() => setPopover(null)}>Dismiss</button>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="stats">
          <span>{wordCount(text).toLocaleString()} words</span>
          <span>{text.length.toLocaleString()} chars</span>
        </div>
        <div className="issue-summary">
          {checking && <span className="checking"><span className="spinner-small" /> Checking…</span>}
          {!checking && error && <span className="ft-error">{error}</span>}
          {!checking && !error && matches.length === 0 && text.trim() && ltReady && (
            <span className="no-issues">✓ No issues found</span>
          )}
          {!checking && matches.length > 0 && (
            <>
              {errorCount > 0 && <span className="badge badge-error">{errorCount} error{errorCount !== 1 ? 's' : ''}</span>}
              {warnCount > 0 && <span className="badge badge-warn">{warnCount} suggestion{warnCount !== 1 ? 's' : ''}</span>}
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
