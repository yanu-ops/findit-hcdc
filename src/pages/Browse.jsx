import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PostCard from '../components/PostCard'
import LoadingSpinner from '../components/LoadingSpinner'

const DARK_RED = '#8B0000'

/* ── Category SVG icons for filter chips ── */
const CAT_ICONS = {
  All: col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Electronics: col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
    </svg>
  ),
  Clothing: col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  'ID / Cards': col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
    </svg>
  ),
  Bags: col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Books: col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Keys: col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  Wallet: col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
    </svg>
  ),
  Other: col => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
}

const CATEGORIES = [
  'All', 'Electronics', 'Clothing', 'ID / Cards',
  'Bags', 'Books', 'Keys', 'Wallet', 'Other',
]

const MOBILE_TYPES = [
  { key: 'all',   label: 'All'   },
  { key: 'lost',  label: 'Lost'  },
  { key: 'found', label: 'Found' },
]

const DESKTOP_TYPES = [
  { key: 'all',   label: 'All Items' },
  { key: 'lost',  label: 'Lost'      },
  { key: 'found', label: 'Found'     },
]

function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return v
}

export default function Browse() {
  const isMobile = useIsMobile()
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [type,     setType]     = useState('all')

  useEffect(() => { fetchPosts() }, [type, category])

  async function fetchPosts() {
    setLoading(true)
    let q = supabase
      .from('posts')
      .select('*, users(full_name)')
      .order('created_at', { ascending: false })
      .eq('status', 'active')
    if (type !== 'all') q = q.eq('type', type)
    if (category !== 'All') q = q.eq('category', category)
    const { data } = await q
    setPosts(data || [])
    setLoading(false)
  }

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  )

  /* ── Shared empty state ── */
  const EmptyState = ({ message = 'Try different filters' }) => (
    <div style={{ textAlign: 'center', padding: '52px 0', color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 44, height: 44 }}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No items found</div>
      <div style={{ fontSize: 13 }}>{message}</div>
    </div>
  )

  /* ── Category chip (shared) ── */
  const CatChip = ({ label }) => {
    const active = category === label
    const Icon   = CAT_ICONS[label]
    const col    = active ? DARK_RED : '#64748B'
    return (
      <button onClick={() => setCategory(label)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 99, flexShrink: 0,
        border: active ? `1.5px solid ${DARK_RED}` : '1.5px solid #E5E9F0',
        background: active ? '#FDF2F2' : '#F8F9FB',
        color: col, fontSize: 12, fontWeight: active ? 600 : 400,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}>
        {Icon && Icon(col)}
        {label}
      </button>
    )
  }

  /* ════════════════════════════════════════════
     MOBILE layout
  ════════════════════════════════════════════ */
  if (isMobile) return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>

      {/* Type tabs — sticky under the top header */}
      <div style={{
        position: 'sticky', top: 56, zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #F1F5F9',
        padding: '0 16px',
        display: 'flex',
      }}>
        {MOBILE_TYPES.map(t => {
          const active = type === t.key
          return (
            <button key={t.key} onClick={() => setType(t.key)} style={{
              flex: 1, padding: '12px 0', border: 'none',
              background: 'transparent',
              color: active ? DARK_RED : '#94A3B8',
              fontSize: 14, fontWeight: active ? 700 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
              borderBottom: active ? `2px solid ${DARK_RED}` : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
            }}>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Search bar */}
      <div style={{ padding: '12px 16px 8px', background: '#fff' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', pointerEvents: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search items or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              border: '1.5px solid #E5E9F0', borderRadius: 10,
              fontSize: 13, outline: 'none', fontFamily: 'inherit',
              boxSizing: 'border-box', color: '#0F172A', background: '#F8F9FB',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = DARK_RED}
            onBlur={e => e.target.style.borderColor = '#E5E9F0'}
          />
        </div>
      </div>

      {/* Category chips — horizontally scrollable */}
      <div style={{
        display: 'flex', gap: 7, padding: '4px 16px 10px',
        overflowX: 'auto', background: '#fff',
        msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(c => <CatChip key={c} label={c} />)}
      </div>

      {/* ── Card list — single column, one item per row ── */}
      <div style={{ padding: '8px 12px 80px' }}>
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  )

  /* ════════════════════════════════════════════
     DESKTOP / TABLET layout
  ════════════════════════════════════════════ */
  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Lost &amp; Found Board
        </h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          Browse and message to recover items on campus.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none', display: 'flex' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search items, locations, descriptions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px 12px 44px',
            border: '1.5px solid #E5E9F0', borderRadius: 12,
            fontSize: 14, outline: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box', color: '#0F172A', background: '#fff',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
          onFocus={e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }}
          onBlur={e => { e.target.style.borderColor = '#E5E9F0'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
        />
      </div>

      {/* Type filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {DESKTOP_TYPES.map(t => {
          const active = type === t.key
          return (
            <button key={t.key} onClick={() => setType(t.key)} style={{
              padding: '8px 20px', borderRadius: 99,
              border: active ? 'none' : '1.5px solid #E5E9F0',
              background: active ? DARK_RED : '#fff',
              color: active ? '#fff' : '#475569',
              fontSize: 13, fontWeight: active ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              boxShadow: active ? '0 2px 8px rgba(139,0,0,0.25)' : 'none',
            }}>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(c => <CatChip key={c} label={c} />)}
      </div>

      {/* Item count */}
      {!loading && (
        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
        </div>
      )}

      {/* 2-column grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState message="Try different filters or search terms" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {filtered.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}