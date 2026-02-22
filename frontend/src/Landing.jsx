import './Landing.css'

export default function Landing({ setView }) {
    return (
        <div className="landing-page">
            <nav>
                <div className="nav-logo">
                    <div className="logo-mark">
                        <svg viewBox="0 0 40 40" fill="none">
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
                    </div>
                    <span className="nav-logo-text"><span className="trans">Trans</span><span className="craft">Craft</span></span>
                </div>
            </nav>

            <section className="hero">
                <div className="hero-inner">
                    <div className="hero-text">
                        <span className="hero-eyebrow">Available Now</span>
                        <h1 className="hero-h1">Write better.<br />In <em className="hero-em">any</em> language.</h1>
                        <p className="hero-sub">Professional proofreading and translation powered by AI — a seamless cycle from draft to polished.</p>
                    </div>

                    <div className="hero-right-cards">
                        <div onClick={() => setView('proofread')} className="tool-card tc-navy">
                            <div className="tool-card-header">
                                <div className="tool-card-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="3" width="11" height="3" rx="1.5" fill="#7aacff" />
                                        <rect x="7" y="3" width="3" height="18" rx="1.5" fill="#7aacff" />
                                        <path d="M14 18 L18 6 L22 18" stroke="#7aacff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <line x1="15.2" y1="14.5" x2="20.8" y2="14.5" stroke="#7aacff" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <span className="tool-card-title">Proofread</span>
                            </div>
                            <p className="tool-card-desc">Catch grammar, spelling, and style errors instantly. Accept or reject each AI suggestion individually — full control, zero friction.</p>
                            <div className="tool-card-tags">
                                <span className="tool-card-tag">Grammar</span>
                                <span className="tool-card-tag">Style</span>
                                <span className="tool-card-tag">AI Rewrite</span>
                            </div>
                            <span className="tool-card-cta">Open Tool →</span>
                        </div>

                        <div onClick={() => setView('translate')} className="tool-card tc-gold">
                            <div className="tool-card-header">
                                <div className="tool-card-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="9" stroke="#4ade80" strokeWidth="2" fill="none" />
                                        <ellipse cx="12" cy="12" rx="4.5" ry="9" stroke="#4ade80" strokeWidth="1.5" fill="none" />
                                        <line x1="3" y1="9" x2="21" y2="9" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
                                        <line x1="3" y1="15" x2="21" y2="15" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <span className="tool-card-title">Translate</span>
                            </div>
                            <p className="tool-card-desc">Context-aware translation across 100+ languages. Preserves tone, formatting, and technical terminology — not just words.</p>
                            <div className="tool-card-tags">
                                <span className="tool-card-tag">Multilingual</span>
                                <span className="tool-card-tag">100+ languages</span>
                                <span className="tool-card-tag">Context-aware</span>
                            </div>
                            <span className="tool-card-cta">Open Tool →</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
