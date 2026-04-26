import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const DARK_RED = '#8B0000'

/* ── Category SVG icons ── */
const CAT_ICON = {
  Electronics: (col, size = 20) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
    </svg>
  ),
  Clothing: (col, size = 20) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  'ID / Cards': (col, size = 20) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
    </svg>
  ),
  Bags: (col, size = 20) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Books: (col, size = 20) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Keys: (col, size = 20) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  Wallet: (col, size = 20) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
    </svg>
  ),
  Other: (col, size = 20) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
}

const CAT_COLOR = {
  Electronics: '#1D4ED8', Clothing: '#15803D', 'ID / Cards': '#C2410C',
  Bags: '#7E22CE', Books: '#B45309', Keys: '#15803D',
  Wallet: '#9D174D', Other: '#475569',
}

const CAT_BG = {
  Electronics: '#EFF6FF', Clothing: '#F0FDF4', 'ID / Cards': '#FFF7ED',
  Bags: '#FDF4FF', Books: '#FFFBEB', Keys: '#F0FDF4',
  Wallet: '#FDF2F8', Other: '#F8FAFC',
}

/* ── Shared small inline icons ── */
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

/* ── Empty state icon — clipboard with lines ── */
const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, marginBottom: 16 }}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
)

/* ══════════════════════════════════════════
   Page
══════════════════════════════════════════ */
export default function MyPosts() {
  const { user } = useStore()
  const [posts, setPosts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert]   = useState(null)

  useEffect(() => { fetchMyPosts() }, [])

  function showAlert(type, text) { setAlert({ type, text }) }

  async function fetchMyPosts() {
    const { data } = await supabase
      .from('posts').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function handleResolve(postId, title) {
    const { error } = await supabase.from('posts').update({ status: 'resolved' }).eq('id', postId)
    if (error) showAlert('error', 'Failed to mark as resolved.')
    else { showAlert('success', `"${title}" marked as Resolved.`); fetchMyPosts() }
  }

  async function handleDelete(postId, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) showAlert('error', 'Failed to delete post.')
    else { showAlert('success', `"${title}" deleted successfully.`); fetchMyPosts() }
  }

  if (loading) return <LoadingSpinner />

  const active   = posts.filter(p => p.status === 'active')
  const resolved = posts.filter(p => p.status === 'resolved')

  return (
    <div>
      {alert && <Alert message={alert.text} type={alert.type} onClose={() => setAlert(null)} />}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>My Posts</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          Manage your lost and found reports.
        </p>
      </div>

      {posts.length === 0 ? (
        /* ── Empty state ── */
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <EmptyIcon />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>No posts yet</div>
          <div style={{ fontSize: 14, marginTop: 4, marginBottom: 20 }}>
            Start by reporting a lost or found item
          </div>
          <Link to="/create" style={{
            display: 'inline-block', padding: '10px 24px',
            background: DARK_RED, color: '#fff', borderRadius: 10,
            textDecoration: 'none', fontWeight: 600, fontSize: 14,
          }}>
            Post an Item
          </Link>
        </div>
      ) : (
        <div>
          {/* Active */}
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Active Posts</h2>
                <span style={{ background: '#FDF2F2', color: DARK_RED, fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99 }}>
                  {active.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map(post => (
                  <PostCard key={post.id} post={post}
                    onResolve={() => handleResolve(post.id, post.title)}
                    onDelete={() => handleDelete(post.id, post.title)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>Resolved Posts</h2>
                <span style={{ background: '#F0FDF4', color: '#166534', fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99 }}>
                  {resolved.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resolved.map(post => (
                  <PostCard key={post.id} post={post}
                    onDelete={() => handleDelete(post.id, post.title)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   PostCard (local, not the Browse one)
══════════════════════════════════════════ */
function PostCard({ post, onResolve, onDelete }) {
  const isResolved = post.status === 'resolved'
  const isLost     = post.type === 'lost'
  const iconFn     = CAT_ICON[post.category] || CAT_ICON.Other
  const iconColor  = isResolved ? '#16A34A' : (CAT_COLOR[post.category] || '#475569')
  const iconBg     = isResolved ? '#F0FDF4' : (CAT_BG[post.category]   || '#F8FAFC')

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: `1.5px solid ${isResolved ? '#D1FAE5' : '#E5E9F0'}`,
      padding: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Top row — thumbnail + title + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        {/* Thumbnail */}
        <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {post.image_url
            ? <img src={post.image_url} alt={post.title} style={{ width: 48, height: 48, objectFit: 'cover' }} />
            : iconFn(iconColor, 22)}
        </div>

        {/* Title + badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.title}
            </h3>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 99,
              fontSize: 11, fontWeight: 600, flexShrink: 0,
              ...(isResolved
                ? { background: '#F0FDF4', color: '#166534' }
                : isLost
                  ? { background: '#FEF2F2', color: '#991B1B' }
                  : { background: '#F0FDF4', color: '#166534' }),
            }}>
              {isResolved && <CheckIcon />}
              {isResolved ? 'Resolved' : isLost ? 'Lost' : 'Found'}
            </span>
          </div>

          {/* Location + date */}
          <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
            <PinIcon />
            {post.location} · {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {post.description}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* View */}
        <Link to={`/post/${post.id}`} style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#F8FAFC', color: '#475569', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 500, border: '1px solid #E5E9F0' }}>
          View
        </Link>

        {/* Resolve */}
        {!isResolved && onResolve && (
          <button onClick={onResolve} style={{ flex: 1, padding: '8px', background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
            onMouseEnter={e => e.currentTarget.style.background = '#DCFCE7'}
            onMouseLeave={e => e.currentTarget.style.background = '#F0FDF4'}
          >
            <CheckIcon />
            Resolve
          </button>
        )}

        {/* Delete */}
        <button onClick={onDelete} style={{ padding: '8px 14px', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
          onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
        >
          <TrashIcon />
          Delete
        </button>
      </div>
    </div>
  )
}