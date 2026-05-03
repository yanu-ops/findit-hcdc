import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const DARK_RED = '#8B0000'

const CAT = {
  Electronics: {
    bg: '#EFF6FF', color: '#1D4ED8',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
      </svg>
    ),
    card: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
}

/* ── Shared small icons ── */
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

/* ── Fixed card height for desktop — image + text always identical ── */
const DESKTOP_CARD_H = 140

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
  const cat    = CAT[post.category] || CAT.Other
  const isLost = post.type === 'lost'
  const isRes  = post.status === 'resolved'

  const badge = isRes
    ? { bg: '#F1F5F9', color: '#64748B', label: 'Resolved' }
    : isLost
      ? { bg: '#FEF2F2', color: '#991B1B', label: 'Lost' }
      : { bg: '#F0FDF4', color: '#166534', label: 'Found' }

  /* ══════════════════════════════════════════════════════
     MOBILE — full-width horizontal list card
     image left (100×100) · text right
     One per row — Browse renders flex column
  ══════════════════════════════════════════════════════ */
  if (isMobile) return (
    <Link
      to={`/post/${post.id}`}
      style={{
        display: 'flex',
        width: '100%',
        height: 100,
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        textDecoration: 'none',
        border: '1px solid #F1F5F9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s',
      }}
      onTouchStart={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
      onTouchEnd={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
    >
      {/* Left — fixed square thumbnail */}
      <div style={{
        width: 100, height: 100, flexShrink: 0,
        background: post.image_url ? '#ffffff' : cat.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {post.image_url
          ? <img src={post.image_url} alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
          : cat.card(cat.color)
        }
      </div>

      {/* Right — text */}
      <div style={{
        flex: 1, minWidth: 0,
        padding: '12px 14px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title}
        </span>
        <span style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
          <PinIcon />
          {post.location} · {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: DARK_RED, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.users?.full_name || 'Unknown'}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, flexShrink: 0, marginLeft: 8, background: badge.bg, color: badge.color }}>
            {badge.label}
          </span>
        </div>
      </div>
    </Link>
  )

  /* ══════════════════════════════════════════════════════
     DESKTOP — horizontal row card (image left, text right)
     2 per row via CSS grid in Browse.jsx
     Fixed DESKTOP_CARD_H so every card is identical height
  ══════════════════════════════════════════════════════ */
  return (
    <Link
      to={`/post/${post.id}`}
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: DESKTOP_CARD_H,          /* fixed — every card identical */
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        textDecoration: 'none',
        border: '1.5px solid #E5E9F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#C41E3A'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(139,0,0,0.13)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E5E9F0'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* ── Image left — fixed square, white bg, contain ── */}
      <div style={{
        width: DESKTOP_CARD_H,           /* square: same as card height */
        height: DESKTOP_CARD_H,
        flexShrink: 0,
        background: post.image_url ? '#ffffff' : cat.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        borderRight: '1px solid #F1F5F9',
      }}>
        {post.image_url
          ? <img
              src={post.image_url}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
            />
          : cat.card(cat.color)
        }
      </div>

      {/* ── Text right ── */}
      <div style={{
        flex: 1, minWidth: 0,
        padding: '16px 18px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        {/* Top: title + description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>

          {/* Title row with status badge */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <h3 style={{
              fontSize: 16, fontWeight: 700, color: '#0F172A',
              margin: 0, lineHeight: 1.25,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1, minWidth: 0,
            }}>
              {post.title}
            </h3>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 99, flexShrink: 0,
              background: badge.bg, color: badge.color,
            }}>
              {badge.label}
            </span>
          </div>

          {/* Description — 2 lines max */}
          <p style={{
            fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {post.description}
          </p>
        </div>

        {/* Bottom: meta + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            {/* Location */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <PinIcon /> {post.location}
            </span>
            {/* Date */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94A3B8' }}>
              <CalIcon /> {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {/* Category chip */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, color: cat.color,
              background: cat.bg, padding: '3px 9px', borderRadius: 99,
            }}>
              {cat.chip(cat.color)} {post.category}
            </span>
            <ChevronRight />
          </div>
        </div>
      </div>
    </Link>
  )
}