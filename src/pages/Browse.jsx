import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import PostCard from '../components/PostCard'
import LoadingSpinner from '../components/LoadingSpinner'

const DARK_RED = '#8B0000'

const CATEGORIES = [
  { label: 'All',         emoji: '🗂️' },
  { label: 'Electronics', emoji: '🎧' },
  { label: 'Clothing',    emoji: '👕' },
  { label: 'ID / Cards',  emoji: '🪪' },
  { label: 'Bags',        emoji: '👜' },
  { label: 'Books',       emoji: '📚' },
  { label: 'Keys',        emoji: '🔑' },
  { label: 'Wallet',      emoji: '👛' },
  { label: 'Other',       emoji: '📦' },
]

/* Mobile tabs match the reference: All · Lost · Found · Resolved */
const MOBILE_TYPES = [
  { key: 'all',      label: 'All'      },
  { key: 'lost',     label: 'Lost'     },
  { key: 'found',    label: 'Found'    },
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

  /* ──────────────────────────────────────────
     MOBILE layout
  ────────────────────────────────────────── */
  if (isMobile) return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh' }}>

      {/* ── Type tabs (All / Lost / Found) — sticky under header ── */}
      <div style={{
        position: 'sticky', top: 56, zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #F1F5F9',
        padding: '0 16px',
        display: 'flex', gap: 0,
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

      {/* ── Search bar ── */}
      <div style={{ padding: '12px 16px 8px', background: '#fff' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', pointerEvents: 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
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

      {/* ── Category chips ── */}
      <div style={{
        display: 'flex', gap: 7, padding: '4px 16px 10px',
        overflowX: 'auto', background: '#fff',
        /* hide scrollbar */
        msOverflowStyle: 'none', scrollbarWidth: 'none',
      }}>
        {CATEGORIES.map(c => {
          const active = category === c.label
          return (
            <button key={c.label} onClick={() => setCategory(c.label)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 99, flexShrink: 0,
              border: active ? `1.5px solid ${DARK_RED}` : '1.5px solid #E5E9F0',
              background: active ? '#FDF2F2' : '#F8F9FB',
              color: active ? DARK_RED : '#64748B',
              fontSize: 12, fontWeight: active ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 13 }}>{c.emoji}</span>
              {c.label}
            </button>
          )
        })}
      </div>

      {/* ── Card list ── */}
      <div style={{ padding: '0 12px 12px' }}>
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>No items found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try different filters</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </div>
    </div>
  )

  /* ──────────────────────────────────────────
     DESKTOP / TABLET layout
  ────────────────────────────────────────── */
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
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input type="text" placeholder="Search items, locations, descriptions..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 44px', border: '1.5px solid #E5E9F0', borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#0F172A', background: '#fff', transition: 'border-color 0.15s, box-shadow 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
          onFocus={e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }}
          onBlur={e => { e.target.style.borderColor = '#E5E9F0'; e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
        />
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {DESKTOP_TYPES.map(t => {
          const active = type === t.key
          return (
            <button key={t.key} onClick={() => setType(t.key)} style={{ padding: '8px 20px', borderRadius: 99, border: active ? 'none' : '1.5px solid #E5E9F0', background: active ? DARK_RED : '#fff', color: active ? '#fff' : '#475569', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: active ? '0 2px 8px rgba(139,0,0,0.25)' : 'none' }}>
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(c => {
          const active = category === c.label
          return (
            <button key={c.label} onClick={() => setCategory(c.label)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 99, border: active ? 'none' : '1.5px solid #E5E9F0', background: active ? '#FDF2F2' : '#fff', color: active ? DARK_RED : '#475569', fontSize: 13, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0, boxShadow: active ? `0 0 0 1.5px ${DARK_RED} inset` : 'none' }}>
              <span style={{ fontSize: 15 }}>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          )
        })}
      </div>

      {/* Count */}
      {!loading && (
        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>No items found</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Try different filters or search terms</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
          {filtered.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}