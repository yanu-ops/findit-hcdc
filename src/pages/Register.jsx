import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Alert from '../components/Alert'

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
   FormCard lives OUTSIDE Register so React never unmounts it
   on a state update (which would kill the focused input).
   All mutable values come in as props — no closures over the
   parent's render scope that could cause identity changes.
───────────────────────────────────────────────────────────── */
function FormCard({
  isMobile,
  form, setForm,
  showPass, setShowPass,
  showConfirm, setShowConfirm,
  error, loading,
  onSubmit,
}) {
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

      <h1 style={{ fontSize: isMobile ? 30 : 36, fontWeight: 800, color: '#1E2A5E', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
        Sign Up
      </h1>
      <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px' }}>
        Create your FindIt @ HCDC account
      </p>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '11px 14px', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, animation: 'shake 0.35s ease' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Full name */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Username</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', pointerEvents: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text" required
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="e.g. Juan dela Cruz"
              style={fieldBase}
              onFocus={onFocus} onBlur={onBlur}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', pointerEvents: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="you@hcdc.edu.ph"
              style={fieldBase}
              onFocus={onFocus} onBlur={onBlur}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Password</label>
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
              placeholder="At least 6 characters"
              style={{ ...fieldBase, paddingRight: 44 }}
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

        {/* Confirm password */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', pointerEvents: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showConfirm ? 'text' : 'password'} required
              value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              placeholder="Repeat your password"
              style={{ ...fieldBase, paddingRight: 44 }}
              onFocus={onFocus} onBlur={onBlur}
            />
            <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, display: 'flex' }}>
              {showConfirm
                ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Terms */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#374151', lineHeight: 1.6, marginTop: 2 }}>
          <input
            type="checkbox"
            checked={form.agree}
            onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))}
            style={{ accentColor: DR, width: 15, height: 15, marginTop: 2, flexShrink: 0 }}
          />
          <span>
            I agree to the{' '}
            <span style={{ color: DR, fontWeight: 600 }}>Terms of Use</span>
            {' '}and{' '}
            <span style={{ color: DR, fontWeight: 600 }}>Privacy Policy</span>
            {' '}of FindIt @ HCDC.
          </span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#A01830' : DR, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 4 }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6B0000' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = DR }}
        >
          {loading
            ? <><span style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />Creating…</>
            : 'CREATE ACCOUNT'
          }
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#64748B', marginTop: 22 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: DR, fontWeight: 700, textDecoration: 'none' }}>Sign in here</Link>
      </p>
    </div>
  )
}

/* ── Main page component ── */
export default function Register() {
  const isMobile = useIsMobile()
  const [form, setForm]               = useState({ full_name: '', email: '', password: '', confirm: '', agree: false })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError]             = useState('')
  const [alert, setAlert]             = useState(null)
  const [loading, setLoading]         = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.agree)                    return setError('You must agree to the terms to continue.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6)      return setError('Password must be at least 6 characters.')

    setLoading(true)
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name, student_id: '' } },
      })
      if (authErr) { setError(authErr.message); setLoading(false); return }
      if (!authData.user) { setError('Registration failed. Please try again.'); setLoading(false); return }

      await supabase.auth.signInWithPassword({ email: form.email, password: form.password })

      const { data: existing } = await supabase.from('users').select('id').eq('id', authData.user.id).maybeSingle()
      if (!existing) {
        await supabase.from('users').insert({
          id: authData.user.id,
          full_name: form.full_name,
          student_id: '',
          email: form.email,
        })
      }

      setAlert({ type: 'success', text: 'Account created! Welcome to FindIt @ HCDC.' })
      setForm({ full_name: '', email: '', password: '', confirm: '', agree: false })
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const formProps = {
    isMobile, form, setForm,
    showPass, setShowPass,
    showConfirm, setShowConfirm,
    error, loading,
    onSubmit: handleSubmit,
  }

  /* ── Mobile ── */
  if (isMobile) return (
    <>
      {alert && <Alert message={alert.text} type={alert.type} onClose={() => setAlert(null)} />}
      <div style={{ minHeight: '100vh', background: '#F4F5FA', display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ height: 8, background: `linear-gradient(90deg, ${DR} 0%, #5A0010 100%)`, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px 48px', overflowY: 'auto' }}>
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
      {alert && <Alert message={alert.text} type={alert.type} onClose={() => setAlert(null)} />}
      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'DM Sans, sans-serif', background: '#fff' }}>

        {/* Left illustration */}
        <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative', minHeight: '100vh' }}>
          <div style={{ position: 'absolute', top: 28, left: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: DR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 8, lineHeight: 1.3, textAlign: 'center' }}>HC<br />DC</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, color: DR, letterSpacing: '-0.5px' }}>
              FindIt<span style={{ color: '#0F172A' }}>@HCDC</span>
            </span>
          </div>

          <svg viewBox="0 0 520 480" style={{ width: '100%', maxWidth: 460, height: 'auto' }} xmlns="http://www.w3.org/2000/svg">
            <rect x="200" y="50" width="180" height="320" rx="20" fill="#1E2A5E" />
            <rect x="210" y="64" width="160" height="292" rx="14" fill="#2A3A7C" />
            <rect x="210" y="64" width="160" height="60" rx="14" fill={DR} />
            <circle cx="290" cy="93" r="20" fill="rgba(255,255,255,0.2)" />
            <circle cx="290" cy="87" r="9" fill="rgba(255,255,255,0.4)" />
            <ellipse cx="290" cy="108" rx="13" ry="7" fill="rgba(255,255,255,0.4)" />
            {[0,1,2,3].map(i => (
              <g key={i}>
                <rect x="224" y={138 + i*42} width="132" height="16" rx="5" fill="#EAECF4" opacity="0.3" />
                <rect x="224" y={158 + i*42} width="132" height="22" rx="6" fill="#EAECF4" opacity="0.15" />
              </g>
            ))}
            <rect x="224" y="318" width="132" height="26" rx="8" fill={DR} opacity="0.9" />
            <text x="290" y="335" textAnchor="middle" fill="#fff" style={{ fontSize: 9.5, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>CREATE ACCOUNT</text>
            <rect x="196" y="90" width="8" height="240" rx="4" fill={DR} />
            <circle cx="150" cy="155" r="35" fill="#FFDDB5" />
            <path d="M118 145 Q125 118 150 115 Q175 118 182 145" fill="#1E2A5E" />
            <ellipse cx="150" cy="125" rx="25" ry="15" fill="#1E2A5E" />
            <circle cx="140" cy="155" r="4" fill="#1E2A5E" />
            <circle cx="160" cy="155" r="4" fill="#1E2A5E" />
            <path d="M141 165 Q150 173 159 165" stroke="#1E2A5E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <rect x="142" y="185" width="16" height="16" rx="4" fill="#FFDDB5" />
            <path d="M100 270 L112 200 Q150 188 188 200 L200 270 Z" fill="#fff" stroke="#1E2A5E" strokeWidth="2" />
            <path d="M138 200 L150 218 L162 200" fill="#1E2A5E" />
            <rect x="110" y="266" width="80" height="10" rx="4" fill="#1E2A5E" />
            <path d="M110 276 L122 370 L146 370 L150 320 L154 370 L178 370 L190 276 Z" fill="#1E2A5E" />
            <ellipse cx="128" cy="376" rx="20" ry="9" fill="#0F172A" />
            <ellipse cx="172" cy="376" rx="20" ry="9" fill="#0F172A" />
            <path d="M188 215 Q215 220 228 235" stroke="#FFDDB5" strokeWidth="18" fill="none" strokeLinecap="round" />
            <path d="M112 215 Q90 200 75 180" stroke="#FFDDB5" strokeWidth="18" fill="none" strokeLinecap="round" />
            <circle cx="71" cy="175" r="10" fill="#FFDDB5" />
            <rect x="50" y="90" width="80" height="100" rx="8" fill="#fff" stroke="#1E2A5E" strokeWidth="2" />
            <rect x="80" y="84" width="20" height="14" rx="4" fill="#1E2A5E" />
            {[0,1,2,3,4].map(i => <rect key={i} x="62" y={108 + i*16} width={i===0?56:44} height="6" rx="3" fill="#E8EBF8" />)}
            <path d="M62 110 L66 115 L74 104" stroke={DR} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M62 126 L66 131 L74 120" stroke={DR} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <p style={{ fontSize: 15, color: '#64748B', textAlign: 'center', maxWidth: 320, lineHeight: 1.7, margin: '8px 0 0' }}>
            Join thousands of HCDC students recovering lost items every day.
          </p>
        </div>

        {/* Right form */}
        <div style={{ width: 480, minHeight: '100vh', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', background: '#F4F5FA', overflowY: 'auto' }}>
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
      @keyframes spin  { to { transform: rotate(360deg); } }
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    `}</style>
  )
}