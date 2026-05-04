import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const DARK_RED = '#8B0000'
const CATS = ['Electronics', 'Clothing', 'ID / Cards', 'Bags', 'Books', 'Keys', 'Wallet', 'Other']

/* ── Category SVG icons ── */
function CatIconSVG(category, color = '#94A3B8', size = 56) {
  const p = {
    viewBox: '0 0 24 24', fill: 'none', stroke: color,
    strokeWidth: '1.4', strokeLinecap: 'round', strokeLinejoin: 'round',
    style: { width: size, height: size, opacity: 0.7 },
  }
  switch (category) {
    case 'Electronics':
      return <svg {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/></svg>
    case 'Clothing':
      return <svg {...p}><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>
    case 'ID / Cards':
      return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/></svg>
    case 'Bags':
      return <svg {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    case 'Books':
      return <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'Keys':
      return <svg {...p}><circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/></svg>
    case 'Wallet':
      return <svg {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
    default:
      return <svg {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
  }
}

const CAT_COLOR = {
  Electronics: '#1D4ED8', Clothing: '#15803D', 'ID / Cards': '#C2410C',
  Bags: '#7E22CE', Books: '#B45309', Keys: '#15803D', Wallet: '#9D174D', Other: '#475569',
}
const CAT_BG = {
  Electronics: '#EFF6FF', Clothing: '#F0FDF4', 'ID / Cards': '#FFF7ED',
  Bags: '#FDF4FF', Books: '#FFFBEB', Keys: '#F0FDF4', Wallet: '#FDF2F8', Other: '#F8FAFC',
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

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const isMobile = useIsMobile()

  const [post, setPost]   = useState(null)
  const [loading, setLoading] = useState(true)

  /* Edit state */
  const [editing, setEditing]         = useState(false)
  const [editForm, setEditForm]       = useState({})
  const [editImageFile, setEditImageFile] = useState(null)
  const [editPreview, setEditPreview] = useState(null)
  const [saving, setSaving]           = useState(false)
  const [editError, setEditError]     = useState('')

  const [alert, setAlert] = useState(null)

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

  /* Keep poster avatar in sync live */
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
      const { data: upData, error: upErr } = await supabase.storage
        .from('item-photos').upload(fn, editImageFile)
      if (upErr) {
        setEditError('Image upload failed. Please try again.')
        setSaving(false)
        return
      }
      image_url = supabase.storage.from('item-photos').getPublicUrl(upData.path).data.publicUrl
    }

    const { error } = await supabase.from('posts').update({ ...editForm, image_url }).eq('id', id)

    if (error) {
      setEditError(error.message)
    } else {
      await fetchPost()
      setEditing(false)
      setAlert({ type: 'success', text: `"${editForm.title}" has been updated successfully.` })
    }
    setSaving(false)
  }

  async function handleResolve() {
    if (!confirm('Mark this post as Resolved?')) return
    await supabase.from('posts').update({ status: 'resolved' }).eq('id', id)
    fetchPost()
    setAlert({ type: 'success', text: 'Post marked as resolved.' })
  }

  if (loading) return <LoadingSpinner />
  if (!post) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#94A3B8', fontSize: 15 }}>Post not found.</div>
  )

  const isOwner    = user?.id === post.user_id
  const isResolved = post.status === 'resolved'
  const catColor   = CAT_COLOR[post.category] || '#475569'
  const catBg      = CAT_BG[post.category] || '#F8FAFC'

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

  /* ── Shared action buttons ── */
  const ActionButtons = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {isResolved ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 600, color: '#166534' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="20 6 9 17 4 12"/></svg>
            This item has been resolved
          </div>
          {isOwner && (
            <button onClick={openEdit}
              style={{ width: '100%', padding: '12px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E5E9F0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
              onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Post
            </button>
          )}
        </>
      ) : isOwner ? (
        <>
          <button onClick={handleResolve}
            style={{ width: '100%', padding: '13px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
            onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><polyline points="20 6 9 17 4 12"/></svg>
            Mark as Resolved
          </button>
          <button onClick={openEdit}
            style={{ width: '100%', padding: '12px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E5E9F0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Post
          </button>
        </>
      ) : (
        <button onClick={() => navigate(`/chat/${post.id}/${post.users.id}`)}
          style={{ width: '100%', padding: '13px', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1446B8'}
          onMouseLeave={e => e.currentTarget.style.background = '#1A56DB'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Message {post.users?.full_name?.split(' ')[0]}
        </button>
      )}
    </div>
  )

  return (
    <div style={{ maxWidth: isMobile ? '100%' : 900, margin: '0 auto', width: '100%' }}>

      {alert && (
        <Alert message={alert.text} type={alert.type} onClose={() => setAlert(null)} />
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, fontFamily: 'inherit', padding: '6px 0' }}
        onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Back
      </button>

      {/* ════════════════ VIEW MODE ════════════════ */}
      {!editing && (
        <>
          {/* ── MOBILE: image top, content below (unchanged) ── */}
          {isMobile && (
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>

              {/* Image top */}
              <div style={{
                width: '100%', height: 260,
                background: post.image_url ? '#ffffff' : catBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', borderBottom: '1px solid #F1F5F9', flexShrink: 0,
              }}>
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    {CatIconSVG(post.category, catColor, 56)}
                    <span style={{ fontSize: 13, fontWeight: 600, color: catColor, opacity: 0.7 }}>{post.category}</span>
                  </div>
                )}
              </div>

              {/* Details below */}
              <div style={{ padding: '20px 20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                    ...(isResolved ? { background: '#F1F5F9', color: '#64748B' } : post.type === 'lost' ? { background: '#FEF2F2', color: '#991B1B' } : { background: '#F0FDF4', color: '#166534' }),
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                    {isResolved ? 'Resolved' : post.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: catBg, color: catColor, border: `1px solid ${catColor}22` }}>
                    {CatIconSVG(post.category, catColor, 12)}
                    {post.category}
                  </span>
                </div>

                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.3px' }}>{post.title}</h1>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: '0 0 18px' }}>{post.description}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {[
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Location', value: post.location },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Date', value: new Date(post.date_lost_found).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fff', border: '1px solid #E5E9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', marginTop: 1 }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9', marginBottom: 18 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
                    {post.users?.avatar_url ? <img src={post.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : post.users?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>{post.users?.full_name}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Posted this item</p>
                  </div>
                </div>

                <ActionButtons />
              </div>
            </div>
          )}

          {/* ── DESKTOP: image left, details right ── */}
          {!isMobile && (
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #F1F5F9', overflow: 'hidden', display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>

              {/* Left — image panel, natural height, no fixed height */}
              <div style={{
                width: 340, flexShrink: 0,
                background: post.image_url ? '#ffffff' : catBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRight: '1px solid #F1F5F9',
                overflow: 'hidden',
                minHeight: 400,
              }}>
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 32 }}>
                    {CatIconSVG(post.category, catColor, 72)}
                    <span style={{ fontSize: 14, fontWeight: 600, color: catColor, opacity: 0.7 }}>{post.category}</span>
                  </div>
                )}
              </div>

              {/* Right — details panel, scrollable if content is tall */}
              <div style={{ flex: 1, minWidth: 0, padding: '28px 28px 28px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

                {/* Status + category chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                    ...(isResolved ? { background: '#F1F5F9', color: '#64748B' } : post.type === 'lost' ? { background: '#FEF2F2', color: '#991B1B' } : { background: '#F0FDF4', color: '#166634' }),
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                    {isResolved ? 'Resolved' : post.type === 'lost' ? 'Lost' : 'Found'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: catBg, color: catColor, border: `1px solid ${catColor}22` }}>
                    {CatIconSVG(post.category, catColor, 12)}
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', lineHeight: 1.2, letterSpacing: '-0.3px' }}>
                  {post.title}
                </h1>

                {/* Description */}
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: '0 0 20px' }}>
                  {post.description}
                </p>

                {/* Meta rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {[
                    {
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                      label: 'Location', value: post.location,
                    },
                    {
                      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                      label: 'Date', value: new Date(post.date_lost_found).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }),
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #F1F5F9' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fff', border: '1px solid #E5E9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', marginTop: 1 }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Poster */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9', marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: 'hidden' }}>
                    {post.users?.avatar_url
                      ? <img src={post.users.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : post.users?.full_name?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>{post.users?.full_name}</p>
                    <p style={{ fontSize: 12, color: '#94A3B8', margin: '2px 0 0' }}>Posted this item</p>
                  </div>
                </div>

                {/* Push action buttons to bottom */}
                <div style={{ marginTop: 'auto' }}>
                  <ActionButtons />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════ EDIT MODE ════════════════ */}
      {editing && (
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>

          {/* Edit header */}
          <div style={{ padding: '22px 28px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>Edit Post</h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>Update the details for this item</p>
            </div>
            <button onClick={() => setEditing(false)}
              style={{ background: '#F8FAFC', border: '1.5px solid #E5E9F0', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FECACA'; e.currentTarget.style.color = '#991B1B' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E5E9F0'; e.currentTarget.style.color = '#64748B' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div style={{ padding: '24px 28px 28px' }}>
            {editError && (
              <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '11px 14px', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {editError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Type toggle */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { val: 'lost',  label: 'Lost'  },
                    { val: 'found', label: 'Found' },
                  ].map(({ val, label }) => (
                    <button key={val} type="button"
                      onClick={() => setEditForm(f => ({ ...f, type: val }))}
                      style={{ flex: 1, padding: '11px', borderRadius: 10, border: editForm.type === val ? 'none' : '1.5px solid #E5E9F0', background: editForm.type === val ? (val === 'lost' ? DARK_RED : '#15803D') : '#F8FAFC', color: editForm.type === val ? '#fff' : '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two-column grid */}
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
                    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#ffffff', border: '1.5px solid #E5E9F0' }}>
                      <img src={editPreview} alt="preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }} />
                      <div
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.38)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                      >
                        <span
                          style={{ opacity: 0, color: '#fff', fontWeight: 600, fontSize: 13, background: 'rgba(0,0,0,0.65)', padding: '8px 18px', borderRadius: 99, transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                          Click to change photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ border: '2px dashed #E5E7EB', borderRadius: 12, padding: '40px', textAlign: 'center', color: '#94A3B8', transition: 'border-color 0.15s, background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = DARK_RED; e.currentTarget.style.background = '#FDF2F2' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 40, display: 'block', margin: '0 auto 10px' }}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 4 }}>Click to upload a photo</div>
                      <div style={{ fontSize: 12 }}>JPG, PNG, WEBP supported</div>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleEditImage} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Form buttons */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="submit" disabled={saving}
                  style={{ flex: 1, padding: '13px', background: saving ? '#94A3B8' : DARK_RED, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#6B0000' }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = saving ? '#94A3B8' : DARK_RED }}
                >
                  {saving
                    ? <><div style={{ width: 15, height: 15, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving…</>
                    : <><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><polyline points="20 6 9 17 4 12"/></svg>Save Changes</>
                  }
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  style={{ flex: 1, padding: '13px', background: '#F8FAFC', color: '#475569', border: '1.5px solid #E5E9F0', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}