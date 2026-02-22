export default function Translate({ onBack }) {
    const configuredEngineUrl = String(import.meta.env.VITE_TRANSLATE_ENGINE_URL || '').trim()
    const defaultEngineUrl = 'http://127.0.0.1:5178'
    const engineUrl = configuredEngineUrl || defaultEngineUrl
    let isSelfEmbedding = false
    try {
        const current = new URL(window.location.href)
        const target = new URL(engineUrl, window.location.href)
        isSelfEmbedding = current.origin === target.origin && current.port === target.port
    } catch {
        isSelfEmbedding = false
    }

    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '36px', background: '#eeeef5', borderBottom: '1px solid #d0d0de', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '10px', flexShrink: 0 }}>
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
                    <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.01em' }}>
                        <span style={{ color: '#1a3a6b' }}>Trans</span>
                        <span style={{ color: '#e8620a' }}>Craft</span>
                        <span style={{ color: '#9090a8', fontWeight: 400, marginLeft: '3px' }}>Translate</span>
                    </span>
                </div>
            </div>
            {isSelfEmbedding ? (
                <div style={{ flex: 1, display: 'grid', placeItems: 'center', background: '#14151a', color: '#d5d9e3', padding: '24px' }}>
                    <div style={{ maxWidth: '760px', width: '100%', border: '1px solid #313649', borderRadius: '12px', background: '#1b1f2b', padding: '18px 20px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>Translation engine URL misconfigured</div>
                        <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#aeb7c9', marginBottom: '10px' }}>
                            This page is trying to embed itself, which creates an infinite nested view.
                            Set <code>VITE_TRANSLATE_ENGINE_URL</code> to your translator app URL.
                        </div>
                        <div style={{ fontSize: '12px', color: '#8f9ab0' }}>
                            Current app: <code>{window.location.origin}</code><br />
                            Expected engine (default): <code>{defaultEngineUrl}</code>
                        </div>
                    </div>
                </div>
            ) : (
                <iframe
                    src={engineUrl}
                    title="JuriVerto Translation Engine"
                    allow="clipboard-write"
                    style={{ flex: 1, border: 'none', width: '100%' }}
                />
            )}
        </div>
    )
}
