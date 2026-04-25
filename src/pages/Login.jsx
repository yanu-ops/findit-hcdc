import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const DR = '#8B0000'

function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return v
}

/* ─────────────────────────────────────────────────────────────
   FormCard is a TOP-LEVEL component (outside Login).
   This is the critical fix — if it were defined as a const
   inside Login, React would treat it as a new component type
   on every keystroke re-render, unmount+remount it, and the
   focused input would be destroyed each time.
───────────────────────────────────────────────────────────── */
function FormCard({ isMobile, form, setForm, showPass, setShowPass, error, loading, onSubmit }) {
  const fieldBase = {
    width: '100%',
    padding: '13px 14px 13px 42px',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    color: '#0F172A',
    background: isMobile ? '#F1F5F9' : '#EAECF4',
    transition: 'box-shadow 0.15s',
  }
  const onFocus = e => { e.target.style.boxShadow = `0 0 0 2.5px ${DR}` }
  const onBlur  = e => { e.target.style.boxShadow = 'none' }

  return (
    <div style={{ width: '100%', maxWidth: isMobile ? '100%' : 400 }}>

      {/* Logo — mobile only */}
      {isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: DR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 9, fontWeight: 800, lineHeight: 1.3, textAlign: 'center' }}>HC<br />DC</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.4px' }}>
            <span style={{ color: DR }}>FindIt</span>
            <span style={{ color: '#0F172A' }}>@HCDC</span>
          </span>
        </div>
      )}

      <h1 style={{ fontSize: isMobile ? 30 : 36, fontWeight: 800, color: '#1E2A5E', margin: `0 0 ${isMobile ? 6 : 28}px`, letterSpacing: '-0.5px' }}>
        Login
      </h1>
      {isMobile && (
        <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px' }}>
          Sign in to your FindIt @ HCDC account
        </p>
      )}

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '11px 14px', fontSize: 13, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, animation: 'shake 0.35s ease' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Email */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', pointerEvents: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@hcdc.edu.ph"
              disabled={loading}
              style={{ ...fieldBase, opacity: loading ? 0.7 : 1 }}
              onFocus={onFocus} onBlur={onBlur}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', pointerEvents: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showPass ? 'text' : 'password'} required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Your password"
              disabled={loading}
              style={{ ...fieldBase, paddingRight: 44, opacity: loading ? 0.7 : 1 }}
              onFocus={onFocus} onBlur={onBlur}
            />
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex' }}>
              {showPass
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
            <input
              type="checkbox"
              checked={form.remember}
              onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
              style={{ accentColor: DR, width: 15, height: 15 }}
            />
            Remember me
          </label>
          <button type="button" style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = DR }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748B' }}
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#A01830' : DR, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6B0000' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = DR }}
        >
          {loading
            ? <><span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />Signing in…</>
            : 'LOGIN'
          }
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#64748B', marginTop: 24 }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: DR, fontWeight: 700, textDecoration: 'none' }}>Sign up here</Link>
      </p>
    </div>
  )
}

/* ── Main page component ── */
export default function Login() {
  const navigate  = useNavigate()
  const isMobile  = useIsMobile()
  const [form, setForm]         = useState({ email: '', password: '', remember: false })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (authErr) { setError(authErr.message); setLoading(false) }
    else navigate('/')
  }

  const formProps = { isMobile, form, setForm, showPass, setShowPass, error, loading, onSubmit: handleSubmit }

  /* ── Mobile ── */
  if (isMobile) return (
    <>
      {loading && !error && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `4px solid rgba(139,0,0,0.15)`, borderTopColor: DR, animation: 'spin 0.75s linear infinite' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: DR }}>Signing you in…</div>
        </div>
      )}
      <div style={{ minHeight: '100vh', background: '#F4F5FA', display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ height: 8, background: `linear-gradient(90deg, ${DR} 0%, #5A0010 100%)` }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px 48px' }}>
          <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 20, padding: '32px 24px', boxShadow: '0 4px 32px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9' }}>
            <FormCard {...formProps} />
          </div>
        </div>
      </div>
      <GlobalStyles />
    </>
  )

  /* ── Desktop ── */
  return (
    <>
      {loading && !error && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: `4px solid rgba(139,0,0,0.15)`, borderTopColor: DR, animation: 'spin 0.75s linear infinite' }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: DR }}>Signing you in…</div>
        </div>
      )}
      <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>

        {/* Left illustration panel */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative', minHeight: '100vh' }}>
          <div style={{ position: 'absolute', top: 28, left: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: DR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 8, lineHeight: 1.3, textAlign: 'center' }}>HC<br />DC</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, color: DR, letterSpacing: '-0.5px' }}>
              FindIt<span style={{ color: '#0F172A' }}>@HCDC</span>
            </span>
          </div>

          <svg viewBox="0 0 520 480" style={{ width: '100%', maxWidth: 480, height: 'auto' }} xmlns="http://www.w3.org/2000/svg">
            <rect x="230" y="60" width="170" height="300" rx="24" fill="#1E2A5E" />
            <rect x="238" y="74" width="154" height="272" rx="16" fill="#2A3A7C" />
            <circle cx="315" cy="140" r="28" fill="#E8EBF8" />
            <circle cx="315" cy="132" r="12" fill="#8B9AC8" />
            <ellipse cx="315" cy="162" rx="18" ry="10" fill="#8B9AC8" />
            <rect x="258" y="182" width="114" height="18" rx="6" fill={DR} />
            <rect x="258" y="210" width="114" height="18" rx="6" fill={DR} opacity="0.7" />
            {[275, 291, 307, 323, 339, 355].map((x, i) => <circle key={i} cx={x} cy="219" r="4" fill="#fff" />)}
            <rect x="258" y="240" width="114" height="26" rx="8" fill={DR} />
            <text x="315" y="258" textAnchor="middle" fill="#fff" style={{ fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>LOG IN</text>
            <circle cx="315" cy="335" r="12" fill="#3A4A8C" />
            <rect x="226" y="100" width="8" height="220" rx="4" fill={DR} />
            <circle cx="168" cy="148" r="34" fill="#FFDDB5" />
            <ellipse cx="168" cy="120" rx="30" ry="18" fill="#1E2A5E" />
            <circle cx="168" cy="118" r="18" fill="#1E2A5E" />
            <circle cx="158" cy="148" r="4" fill="#1E2A5E" />
            <circle cx="178" cy="148" r="4" fill="#1E2A5E" />
            <circle cx="159" cy="147" r="1.5" fill="#fff" />
            <circle cx="179" cy="147" r="1.5" fill="#fff" />
            <path d="M159 158 Q168 166 177 158" stroke="#1E2A5E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <rect x="160" y="178" width="16" height="18" rx="4" fill="#FFDDB5" />
            <path d="M120 260 L130 196 Q168 185 206 196 L216 260 Z" fill="#fff" stroke="#1E2A5E" strokeWidth="2" />
            <path d="M155 196 L168 215 L181 196" fill="#1E2A5E" />
            <rect x="128" y="256" width="84" height="12" rx="4" fill="#1E2A5E" />
            <path d="M128 268 L138 360 L162 360 L168 310 L174 360 L198 360 L208 268 Z" fill="#1E2A5E" />
            <ellipse cx="144" cy="366" rx="20" ry="9" fill="#1E2A5E" />
            <ellipse cx="192" cy="366" rx="20" ry="9" fill="#1E2A5E" />
            <path d="M130 210 Q95 230 82 255" stroke="#FFDDB5" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M206 210 Q228 220 238 230" stroke="#FFDDB5" strokeWidth="18" fill="none" strokeLinecap="round" />
            <circle cx="78" cy="270" r="34" fill={DR} />
            <path d="M62 270 L74 283 L96 256" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="82" cy="255" r="8" fill="#FFDDB5" />
            <circle cx="80" cy="120" r="6" fill={DR} opacity="0.3" />
            <circle cx="420" cy="90" r="8" fill={DR} opacity="0.15" />
            <path d="M 50 200 Q 110 100 200 80" stroke={DR} strokeWidth="1.5" fill="none" strokeDasharray="4 6" opacity="0.25" />
          </svg>

          <p style={{ fontSize: 15, color: '#64748B', textAlign: 'center', maxWidth: 340, lineHeight: 1.7, margin: '8px 0 0' }}>
            Helping HCDC students recover lost belongings through a simple, fast, campus-wide platform.
          </p>
        </div>

        {/* Right form panel */}
        <div style={{ width: 480, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#F4F5FA', flexShrink: 0 }}>
          <FormCard {...formProps} />
        </div>
      </div>
      <GlobalStyles />
    </>
  )
}

function GlobalStyles() {
  return (
    <style>{`
      @keyframes spin   { to { transform: rotate(360deg); } }
      @keyframes shake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    `}</style>
  )
}