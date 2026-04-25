import { useEffect, useState } from 'react'

export default function Alert({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3500)
    return () => clearTimeout(t)
  }, [])

  const colors = {
    success: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: '#16A34A' },
    error:   { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: '#DC2626' },
    info:    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: '#2563EB' },
  }
  const c = colors[type] || colors.success

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      maxWidth: 360,
      width: 'calc(100vw - 40px)',
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      color: c.text,
      borderRadius: 12,
      padding: '13px 16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-12px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      {type === 'success' && (
        <svg viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      )}
      {type === 'error' && (
        <svg viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )}
      {type === 'info' && (
        <svg viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )}
      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
        {message}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: c.text, padding: 0, flexShrink: 0, opacity: 0.6,
          fontSize: 16, lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  )
}