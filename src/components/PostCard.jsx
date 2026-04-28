import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const DARK_RED = '#8B0000'

/* ── Category SVG icons ── */
const CAT = {
  Electronics: {
    bg: '#EFF6FF', color: '#1D4ED8',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
      </svg>
    ),
    placeholder: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: 0.6 }}>
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
      </svg>
    ),
  },
  Clothing: {
    bg: '#F0FDF4', color: '#15803D',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
    placeholder: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: 0.6 }}>
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
  },
  'ID / Cards': {
    bg: '#FFF7ED', color: '#C2410C',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
        <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
      </svg>
    ),
    placeholder: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: 0.6 }}>
        <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
      </svg>
    ),
  },
  Bags: {
    bg: '#FDF4FF', color: '#7E22CE',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    placeholder: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: 0.6 }}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  Books: {
    bg: '#FFFBEB', color: '#B45309',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    placeholder: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: 0.6 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
  Keys: {
    bg: '#F0FDF4', color: '#15803D',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
        <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
      </svg>
    ),
    placeholder: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: 0.6 }}>
        <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
      </svg>
    ),
  },
  Wallet: {
    bg: '#FDF2F8', color: '#9D174D',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
      </svg>
    ),
    placeholder: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: 0.6 }}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
      </svg>
    ),
  },
  Other: {
    bg: '#F8FAFC', color: '#475569',
    chip: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    placeholder: col => (
      <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, opacity: 0.6 }}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
}

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const CalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, flexShrink: 0 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
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
  const cat    = CAT[post.category] || CAT.Other
  const isLost = post.type === 'lost'
  const isRes  = post.status === 'resolved'

  const badgeStyle = isRes
    ? { bg: '#F1F5F9', color: '#475569' }
    : isLost
      ? { bg: 'rgba(139,0,0,0.88)', color: '#fff' }
      : { bg: 'rgba(22,101,52,0.88)', color: '#fff' }

  const badgeLabel = isRes ? 'Resolved' : isLost ? 'Lost' : 'Found'

  /* ── Image section: cover fills the box cleanly, no background color ── */
  const ImageBox = ({ width, height, borderRadius }) => (
    <div style={{
      width, height,
      flexShrink: 0,
      borderRadius,
      overflow: 'hidden',
      position: 'relative',
      /* Only use cat.bg when there's no image — never a dark bg */
      background: post.image_url ? 'transparent' : cat.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {post.image_url ? (
        <img
          src={post.image_url}
          alt={post.title}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',      /* fills box cleanly, no letterbox */
            objectPosition: 'center',
            display: 'block',
          }}
        />
      ) : (
        cat.placeholder(cat.color)
      )}

      {/* Status badge absolute overlay */}
      <span style={{
        position: 'absolute', top: 8, left: 8,
        background: badgeStyle.bg, color: badgeStyle.color,
        fontSize: 10, fontWeight: 700,
        padding: '3px 8px', borderRadius: 99,
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', gap: 4,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        lineHeight: 1.4,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: isRes ? '#94A3B8' : '#fff', flexShrink: 0 }} />
        {badgeLabel}
      </span>
    </div>
  )

  /* ══════════════════════════════════════
     MOBILE — vertical card (image top, text below)
  ══════════════════════════════════════ */
  if (isMobile) return (
    <Link to={`/post/${post.id}`} style={{
      display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: 14,
      overflow: 'hidden', textDecoration: 'none',
      border: '1px solid #F1F5F9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'box-shadow 0.15s',
    }}
      onTouchStart={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)'}
      onTouchEnd={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'}
    >
      {/* Image top */}
      <ImageBox width="100%" height={160} borderRadius="14px 14px 0 0" />

      {/* Text below */}
      <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <PinIcon /> {post.location}
          </span>
          <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CalIcon /> {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: DARK_RED, fontWeight: 600 }}>
            <UserIcon /> {post.users?.full_name || 'Unknown'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: cat.color, background: cat.bg, padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>
            {cat.chip(cat.color)} {post.category}
          </span>
        </div>
      </div>
    </Link>
  )

  /* ══════════════════════════════════════
     DESKTOP — horizontal card (image left, text right)
  ══════════════════════════════════════ */
  return (
    <Link to={`/post/${post.id}`} style={{
      display: 'flex', flexDirection: 'row',
      background: '#fff', borderRadius: 14,
      overflow: 'hidden', textDecoration: 'none',
      border: '1.5px solid #E5E9F0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#C41E3A'
        e.currentTarget.style.boxShadow = '0 6px 22px rgba(139,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#E5E9F0'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Image left — fixed width, full card height */}
      <ImageBox width={140} height="auto" borderRadius="0" />

      {/* Text right */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, gap: 6 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {/* Title */}
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {post.title}
          </h3>

          {/* Description */}
          <p style={{ fontSize: 12, color: '#64748B', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
            {post.description}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Location + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' }}>
              <PinIcon /> {post.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#94A3B8' }}>
              <CalIcon /> {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Bottom row: poster + category chip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: DARK_RED, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <UserIcon /> {post.users?.full_name || 'Unknown'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: cat.color, background: cat.bg, padding: '3px 8px', borderRadius: 99, fontWeight: 600, flexShrink: 0 }}>
              {cat.chip(cat.color)} {post.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}