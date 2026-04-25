import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const DARK_RED = '#8B0000'

const CAT = {
  Electronics: { emoji: '🎧', bg: '#EFF6FF', color: '#1D4ED8' },
  Clothing:    { emoji: '👕', bg: '#F0FDF4', color: '#15803D' },
  'ID / Cards':{ emoji: '🪪', bg: '#FFF7ED', color: '#C2410C' },
  Bags:        { emoji: '👜', bg: '#FDF4FF', color: '#7E22CE' },
  Books:       { emoji: '📚', bg: '#FFFBEB', color: '#B45309' },
  Keys:        { emoji: '🔑', bg: '#F0FDF4', color: '#15803D' },
  Wallet:      { emoji: '👛', bg: '#FDF2F8', color: '#9D174D' },
  Other:       { emoji: '📦', bg: '#F8FAFC', color: '#475569' },
}

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
     MOBILE  — horizontal card
     Image on left, details on right
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
      marginBottom: 0,
    }}
      onTouchStart={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'}
      onTouchEnd={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
    >
      {/* Left — image / emoji */}
      <div style={{ width: 86, height: 86, flexShrink: 0, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {post.image_url
          ? <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 34 }}>{cat.emoji}</span>}
      </div>

      {/* Right — details */}
      <div style={{ flex: 1, padding: '11px 13px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
            {post.title}
          </span>
        </div>

        {/* Location · date · poster */}
        <span style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.location} · {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} · {post.users?.full_name || 'Unknown'}
        </span>

        {/* Status badge */}
        <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color }}>
          {badge.label}
        </span>
      </div>
    </Link>
  )

  /* ──────────────────────────────────────
     DESKTOP / TABLET  — vertical card
     Large image top, details bottom
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
      {/* Image */}
      <div style={{ width: '100%', height: 200, position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
        {post.image_url
          ? <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: '100%', height: '100%', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>{cat.emoji}</div>}

        {/* Status badge overlay */}
        <span style={{ position: 'absolute', top: 10, right: 10, background: isRes ? '#F1F5F9' : isLost ? 'rgba(139,0,0,0.88)' : 'rgba(22,101,52,0.88)', color: isRes ? '#64748B' : '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 1px 6px rgba(0,0,0,0.15)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isRes ? '#94A3B8' : '#fff', flexShrink: 0 }} />
          {badge.label}
        </span>

        {/* Category chip overlay */}
        <span style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(255,255,255,0.92)', color: cat.color, fontSize: 11, fontWeight: 600, padding: '4px 9px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
          <span style={{ fontSize: 13 }}>{cat.emoji}</span>{post.category}
        </span>
      </div>

      {/* Details */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {post.title}
        </h3>
        <p style={{ fontSize: 12, color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          📍 {post.location} · {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
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