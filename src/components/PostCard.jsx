import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const DARK_RED = '#8B0000'

/* ── Category definitions — SVG icons only, no emojis ── */
const CAT = {
  Electronics: {
    bg: '#EFF6FF', color: '#1D4ED8',
    // chip: small icon for filter pills / card overlays
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
      </svg>
    ),
    // card: medium icon for mobile horizontal card thumbnail
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
      </svg>
    ),
    // big: large icon for desktop vertical card placeholder
    big: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.7 }}>
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
      </svg>
    ),
  },
  Clothing: {
    bg: '#F0FDF4', color: '#15803D',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
    big: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.7 }}>
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
  },
  'ID / Cards': {
    bg: '#FFF7ED', color: '#C2410C',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
      </svg>
    ),
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
      </svg>
    ),
    big: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.7 }}>
        <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
      </svg>
    ),
  },
  Bags: {
    bg: '#FDF4FF', color: '#7E22CE',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    big: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.7 }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  Books: {
    bg: '#FFFBEB', color: '#B45309',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    big: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.7 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  Keys: {
    bg: '#F0FDF4', color: '#15803D',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
      </svg>
    ),
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
      </svg>
    ),
    big: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.7 }}>
        <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
      </svg>
    ),
  },
  Wallet: {
    bg: '#FDF2F8', color: '#9D174D',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
      </svg>
    ),
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
      </svg>
    ),
    big: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.7 }}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
      </svg>
    ),
  },
  Other: {
    bg: '#F8FAFC', color: '#475569',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    big: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, opacity: 0.7 }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
}

/* Small inline location pin — replaces the 📍 emoji */
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0, display: 'inline', verticalAlign: 'middle', marginRight: 2 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return v
}

export default function PostCard({ post }) {
  const isMobile = useIsMobile()
  const cat      = CAT[post.category] || CAT.Other
  const isLost   = post.type === 'lost'
  const isRes    = post.status === 'resolved'

  const badge = isRes
    ? { bg: '#F1F5F9', color: '#64748B', label: 'Resolved' }
    : isLost
      ? { bg: '#FEF2F2', color: '#991B1B', label: 'Lost' }
      : { bg: '#F0FDF4', color: '#166534', label: 'Found' }

  /* ──────────────────────────────────────
     MOBILE — horizontal card
  ────────────────────────────────────── */
  if (isMobile) return (
    <Link to={`/post/${post.id}`} style={{
      display: 'flex',
      background: '#fff',
      borderRadius: 14,
      overflow: 'hidden',
      textDecoration: 'none',
      border: '1px solid #F1F5F9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.15s',
    }}
      onTouchStart={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
      onTouchEnd={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
    >
      {/* Left — image or category icon */}
      <div style={{ width: 86, height: 86, flexShrink: 0, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {post.image_url
          ? <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : cat.card(cat.color)}
      </div>

      {/* Right — details */}
      <div style={{ flex: 1, padding: '11px 13px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title}
        </span>
        <span style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 2 }}>
          <PinIcon />
          {post.location} · {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} · {post.users?.full_name || 'Unknown'}
        </span>
        <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>
    </Link>
  )

  /* ──────────────────────────────────────
     DESKTOP / TABLET — vertical card
  ────────────────────────────────────── */
  return (
    <Link to={`/post/${post.id}`} style={{
      display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: 16,
      border: '1.5px solid #E5E9F0', textDecoration: 'none',
      overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#C41E3A'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(139,0,0,0.13)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E9F0'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Image / placeholder */}
      <div style={{ width: '100%', height: 200, position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        {post.image_url
          ? <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cat.big(cat.color)}
            </div>}

        {/* Status badge — top right */}
        <span style={{ position: 'absolute', top: 10, right: 10, background: isRes ? '#F1F5F9' : isLost ? 'rgba(139,0,0,0.88)' : 'rgba(22,101,52,0.88)', color: isRes ? '#64748B' : '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 1px 6px rgba(0,0,0,0.15)' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: isRes ? '#94A3B8' : '#fff', flexShrink: 0 }} />
          {badge.label}
        </span>

        {/* Category chip — bottom left */}
        <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.92)', color: cat.color, fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(4px)' }}>
          {cat.chip(cat.color)}
          {post.category}
        </span>
      </div>

      {/* Details */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title}
        </h3>
        <p style={{ fontSize: 12, color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
          <PinIcon />
          {post.location} · {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.description}
        </p>
        <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: DARK_RED, fontWeight: 600 }}>by {post.users?.full_name || 'Unknown'}</span>
          <span style={{ fontSize: 11, color: '#94A3B8', background: '#F8FAFC', padding: '2px 8px', borderRadius: 99, border: '1px solid #E5E9F0' }}>View →</span>
        </div>
      </div>
    </Link>
  )
}