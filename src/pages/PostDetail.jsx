import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

const DARK_RED = '#8B0000'
const CATS = ['Electronics', 'Clothing', 'ID / Cards', 'Bags', 'Books', 'Keys', 'Wallet', 'Other']

/* ── SVG category icons (replaces emojis) ── */
const CATEGORY_SVG = {
  Electronics: (col = '#475569', size = 48) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
    </svg>
  ),
  Clothing: (col = '#475569', size = 48) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  'ID / Cards': (col = '#475569', size = 48) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
    </svg>
  ),
  Bags: (col = '#475569', size = 48) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Books: (col = '#475569', size = 48) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Keys: (col = '#475569', size = 48) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  Wallet: (col = '#475569', size = 48) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
    </svg>
  ),
  Other: (col = '#475569', size = 48) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
}

const CAT_COLOR = {
  Electronics: '#1D4ED8', Clothing: '#15803D', 'ID / Cards': '#C2410C',
  Bags: '#7E22CE', Books: '#B45309', Keys: '#15803D', Wallet: '#9D174D', Other: '#475569',
}
const CAT_BG = {
  Electronics: '#EFF6FF', Clothing: '#F0FDF4', 'ID / Cards': '#FFF7ED',
  Bags: '#FDF4FF', Books: '#FFFBEB', Keys: '#F0FDF4', Wallet: '#FDF2F8', Other: '#F8FAFC',
}

/* ── Shared SVG icon components ── */
const IconCheck = ({ size = 16, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconEdit = ({ size = 15, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconMessage = ({ size = 16, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IconCamera = ({ size = 32, color = '#94A3B8' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const IconPin = ({ size = 12, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconCalendar = ({ size = 12, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconTag = ({ size = 12, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
)
const IconUser = ({ size = 14, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconArrowLeft = ({ size = 16, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconAlert = ({ size = 16, color = '#DC2626' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconClose = ({ size = 18, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconLost = ({ size = 15, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)
const IconFound = ({ size = 15, color = 'currentColor' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <polyline points="8 11 10.5 13.5 14.5 9"/>
  </svg>
)

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editImageFile, setEditImageFile] = useState(null)
  const [editPreview, setEditPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => { fetchPost() }, [id])

  async function fetchPost() {
    const { data } = await supabase
      .from('posts')
      .select('*, users(id, full_name, student_id, avatar_url, contact_number)')
      .eq('id', id)
      .single()
    setPost(data)
    setLoading(false)
  }

  useEffect(() => {
    if (!post?.users?.id) return
    const ch = supabase
      .channel(`post-detail-user-${post.users.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${post.users.id}` },
        (payload) => setPost(prev => prev ? { ...prev, users: { ...prev.users, ...payload.new } } : prev)
      )
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [post?.users?.id])

  function openEdit() {
    setEditForm({
      type: post.type, title: post.title, category: post.category,
      location: post.location,
      date_lost_found: post.date_lost_found?.split('T')[0] ?? post.date_lost_found,
      description: post.description,
    })
    setEditPreview(post.image_url || null)
    setEditImageFile(null)
    setEditError('')
    setEditing(true)
  }

  function handleEditImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setEditImageFile(file)
    setEditPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    setEditError('')
    setSaving(true)
    let image_url = post.image_url
    if (editImageFile) {
      const fn = `${user.id}/${Date.now()}-${editImageFile.name}`
      const { data: upData, error: upErr } = await supabase.storage.from('item-photos').upload(fn, editImageFile)
      if (upErr) { setEditError('Image upload failed. Please try again.'); setSaving(false); return }
      image_url = supabase.storage.from('item-photos').getPublicUrl(upData.path).data.publicUrl
    }
    const { error } = await supabase.from('posts').update({ ...editForm, image_url }).eq('id', id)
    if (error) { setEditError(error.message) } else { await fetchPost(); setEditing(false) }
    setSaving(false)
  }

  async function handleResolve() {
    if (!confirm('Mark this post as Resolved?')) return
    await supabase.from('posts').update({ status: 'resolved' }).eq('id', id)
    fetchPost()
  }

  if (loading) return <LoadingSpinner />
  if (!post) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8', fontSize: 15 }}>Post not found.</div>
  )

  const isOwner    = user?.id === post.user_id
  const isResolved = post.status === 'resolved'
  const catColor   = CAT_COLOR[post.category] || '#475569'
  const catBg      = CAT_BG[post.category] || '#F8FAFC'
  const CatIcon    = CATEGORY_SVG[post.category] || CATEGORY_SVG.Other

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: 10,
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', color: '#0F172A', background: '#F8FAFC',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
  const onFocus = e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }
  const onBlur  = e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }
  const upd = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }))

  return (
    /* Wider max-width — better use of desktop space */
    <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, fontFamily: 'inherit', padding: '6px 0' }}
        onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
      >
        <IconArrowLeft size={16} color="currentColor" /> Back
      </button>

      {/* ════════════════ VIEW MODE ════════════════ */}
      {!editing && (
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>

          {/* ── Two-column layout on desktop ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: 0 }}>

            {/* LEFT — image */}
            <div style={{
              position: 'relative',
              background: post.image_url ? '#111827' : catBg,
              minHeight: 420,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  style={{
                    /* Fill 100% of container in both axes, never overflow, never stretch */
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 0.55 }}>
                  {CatIcon(catColor, 72)}
                  <span style={{ fontSize: 13, fontWeight: 600, color: catColor }}>{post.category}</span>
                </div>
              )}

              {/* Status badge overlay */}
              <span style={{
                position: 'absolute', top: 14, left: 14,
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                backdropFilter: 'blur(8px)',
                ...(isResolved
                  ? { background: 'rgba(241,245,249,0.95)', color: '#64748B' }
                  : post.type === 'lost'
                    ? { background: 'rgba(139,0,0,0.88)', color: '#fff' }
                    : { background: 'rgba(22,101,52,0.88)', color: '#fff' }),
              }}>
                {isResolved
                  ? <IconCheck size={13} color="#64748B" />
                  : post.type === 'lost'
                    ? <IconLost size={13} color="#fff" />
                    : <IconFound size={13} color="#fff" />
                }
                {isResolved ? 'Resolved' : post.type === 'lost' ? 'Lost' : 'Found'}
              </span>
            </div>

            {/* RIGHT — details */}
            <div style={{ padding: '32px 32px 28px', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' }}>

              {/* Category chip */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: catBg, color: catColor, fontSize: 12, fontWeight: 600, marginBottom: 14, alignSelf: 'flex-start', border: `1px solid ${catColor}22` }}>
                {CatIcon(catColor, 14)}
                {post.category}
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                {post.title}
              </h1>

              {/* Description */}
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: '0 0 24px' }}>
                {post.description}
              </p>

              {/* Meta rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { Icon: IconPin,      label: 'Location', value: post.location },
                  { Icon: IconCalendar, label: 'Date',     value: new Date(post.date_lost_found).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  { Icon: IconTag,      label: 'Category', value: post.category },
                ].map(({ Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fff', border: '1px solid #E5E9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color="#64748B" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', marginTop: 1 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Poster */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9', marginBottom: 20 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
                  {post.users?.avatar_url
                    ? <img src={post.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : post.users?.full_name?.charAt(0).toUpperCase()
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{post.users?.full_name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <IconUser size={11} color="#94A3B8" /> Posted this item
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 'auto' }}>
                {isResolved ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 600, color: '#166534' }}>
                      <IconCheck size={16} color="#16A34A" /> This item has been resolved
                    </div>
                    {isOwner && (
                      <button onClick={openEdit}
                        style={{ width: '100%', padding: '12px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E5E9F0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                        onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                      >
                        <IconEdit size={15} color="#0F172A" /> Edit Post
                      </button>
                    )}
                  </>
                ) : isOwner ? (
                  <>
                    <button onClick={handleResolve}
                      style={{ width: '100%', padding: '12px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
                      onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
                    >
                      <IconCheck size={16} color="#fff" /> Mark as Resolved
                    </button>
                    <button onClick={openEdit}
                      style={{ width: '100%', padding: '12px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E5E9F0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                    >
                      <IconEdit size={15} color="#0F172A" /> Edit Post
                    </button>
                  </>
                ) : (
                  <button onClick={() => navigate(`/chat/${post.id}/${post.users.id}`)}
                    style={{ width: '100%', padding: '13px', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1446B8'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1A56DB'}
                  >
                    <IconMessage size={16} color="#fff" />
                    Message {post.users?.full_name?.split(' ')[0]}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Mobile stacked fallback via CSS ── */}
          <style>{`
            @media (max-width: 680px) {
              .post-detail-grid {
                grid-template-columns: 1fr !important;
              }
              .post-detail-image {
                min-height: 260px !important;
                max-height: 320px !important;
              }
            }
          `}</style>
        </div>
      )}

      {/* ════════════════ EDIT MODE ════════════════ */}
      {editing && (
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>
          <div style={{ padding: '22px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>Edit Post</h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>Update the details for this item</p>
            </div>
            <button onClick={() => setEditing(false)}
              style={{ background: '#F8FAFC', border: '1.5px solid #E5E9F0', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.color = '#991B1B' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E5E9F0'; e.currentTarget.style.color = '#64748B' }}
            >
              <IconClose size={16} />
            </button>
          </div>

          <div style={{ padding: '24px 28px 28px' }}>
            {editError && (
              <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '11px 14px', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconAlert size={16} />
                {editError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Type toggle */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item Status *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { val: 'lost',  label: 'Lost',  Icon: IconLost  },
                    { val: 'found', label: 'Found', Icon: IconFound },
                  ].map(({ val, label, Icon }) => {
                    const active = editForm.type === val
                    return (
                      <button key={val} type="button" onClick={() => setEditForm(f => ({ ...f, type: val }))}
                        style={{ flex: 1, padding: '11px 10px', borderRadius: 10, border: active ? 'none' : '1.5px solid #E5E9F0', background: active ? (val === 'lost' ? DARK_RED : '#15803D') : '#F8FAFC', color: active ? '#fff' : '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.15s' }}
                      >
                        <Icon size={15} color={active ? '#fff' : '#475569'} />
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Two-column grid for compact form on desktop */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Item Name *</label>
                  <input type="text" required value={editForm.title} onChange={upd('title')} placeholder="e.g. Black umbrella" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Category *</label>
                  <select value={editForm.category} onChange={upd('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Location *</label>
                  <input type="text" required value={editForm.location} onChange={upd('location')} placeholder="e.g. Main Library" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Date *</label>
                  <input type="date" required value={editForm.date_lost_found} onChange={upd('date_lost_found')} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Description *</label>
                <textarea required value={editForm.description} onChange={upd('description')} rows={4}
                  placeholder="Color, brand, distinguishing marks..."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Photo upload */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Photo (optional)</label>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  {editPreview ? (
                    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#0F172A' }}>
                      <img src={editPreview} alt="preview" style={{ width: '100%', height: 200, objectFit: 'contain', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.45)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                      >
                        <div style={{ opacity: 0, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 99 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                          <IconCamera size={16} color="#fff" /> Change photo
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: '2px dashed #E5E7EB', borderRadius: 12, padding: '32px', textAlign: 'center', color: '#94A3B8', transition: 'border-color 0.15s, background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = DARK_RED; e.currentTarget.style.background = '#FDF2F2' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                        <IconCamera size={36} color="#CBD5E1" />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Click to upload a photo</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>JPG, PNG, WEBP supported</div>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleEditImage} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Form actions */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '13px', background: saving ? '#94A3B8' : DARK_RED, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#6B0000' }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = saving ? '#94A3B8' : DARK_RED }}
                >
                  {saving
                    ? <><div style={{ width: 15, height: 15, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                    : <><IconCheck size={15} color="#fff" /> Save Changes</>
                  }
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  style={{ flex: 1, padding: '13px', background: '#F8FAFC', color: '#475569', border: '1.5px solid #E5E9F0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                >
                  <IconClose size={14} color="#475569" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 680px) {
          .post-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}