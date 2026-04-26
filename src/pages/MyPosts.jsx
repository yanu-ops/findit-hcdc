import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const DARK_RED = '#8B0000'
const CATS = ['Electronics', 'Clothing', 'ID / Cards', 'Bags', 'Books', 'Keys', 'Wallet', 'Other']

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

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 56, height: 56, marginBottom: 16 }}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
    <line x1="9" y1="16" x2="13" y2="16"/>
  </svg>
)

/* ── Edit Modal ── */
function EditModal({ post, onClose, onSaved, userId }) {
  const [form, setForm] = useState({
    type: post.type,
    title: post.title,
    category: post.category,
    location: post.location,
    date_lost_found: post.date_lost_found?.split('T')[0] ?? post.date_lost_found,
    description: post.description,
  })
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(post.image_url || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: 10,
    fontSize: 14, outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', color: '#0F172A', background: '#F8FAFC',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
  const onFocus = e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }
  const onBlur  = e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }
  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    let image_url = post.image_url

    if (imageFile) {
      const fn = `${userId}/${Date.now()}-${imageFile.name}`
      const { data: upData, error: upErr } = await supabase.storage
        .from('item-photos').upload(fn, imageFile)
      if (upErr) {
        setError('Image upload failed. Please try again.')
        setSaving(false)
        return
      }
      image_url = supabase.storage.from('item-photos').getPublicUrl(upData.path).data.publicUrl
    }

    const { error: dbErr } = await supabase.from('posts').update({
      ...form, image_url,
    }).eq('id', post.id)

    if (dbErr) {
      setError(dbErr.message)
      setSaving(false)
    } else {
      onSaved()
    }
  }

  return (
    /* Backdrop */
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>Edit Post</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 20, lineHeight: 1, padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
          >✕</button>
        </div>

        <div style={{ padding: '16px 24px 24px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Type toggle */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: 'lost',  label: '😟 Lost'  },
                { val: 'found', label: '✋ Found' },
              ].map(({ val, label }) => (
                <button key={val} type="button"
                  onClick={() => setForm(f => ({ ...f, type: val }))}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: form.type === val ? (val === 'lost' ? DARK_RED : '#15803D') : '#F8FAFC', color: form.type === val ? '#fff' : '#475569', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Item Name *</label>
              <input type="text" required value={form.title} onChange={upd('title')} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Category *</label>
              <select value={form.category} onChange={upd('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Location *</label>
              <input type="text" required value={form.location} onChange={upd('location')} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Date *</label>
              <input type="date" required value={form.date_lost_found} onChange={upd('date_lost_found')} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Description *</label>
              <textarea required value={form.description} onChange={upd('description')} rows={4}
                placeholder="Color, brand, distinguishing marks..."
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            {/* Photo */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Photo (optional)</label>
              <label style={{ display: 'block', cursor: 'pointer' }}>
                {preview ? (
                  <img src={preview} alt="preview" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                ) : (
                  <div style={{ border: '2px dashed #E5E7EB', borderRadius: 10, padding: '20px', textAlign: 'center', color: '#94A3B8', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = DARK_RED}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                  >
                    <div style={{ fontSize: 24, marginBottom: 4 }}>📷</div>
                    <div style={{ fontSize: 13 }}>Click to upload a photo</div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: '12px', background: saving ? '#94A3B8' : DARK_RED, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#6B0000' }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = saving ? '#94A3B8' : DARK_RED }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: '#F8FAFC', color: '#475569', border: '1.5px solid #E5E9F0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Page
══════════════════════════════════════════ */
export default function MyPosts() {
  const { user } = useStore()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert]     = useState(null)
  const [editingPost, setEditingPost] = useState(null)

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

  function handleEditSaved(title) {
    setEditingPost(null)
    showAlert('success', `"${title}" updated successfully.`)
    fetchMyPosts()
  }

  if (loading) return <LoadingSpinner />

  const active   = posts.filter(p => p.status === 'active')
  const resolved = posts.filter(p => p.status === 'resolved')

  return (
    <div>
      {alert && <Alert message={alert.text} type={alert.type} onClose={() => setAlert(null)} />}

      {/* Edit modal */}
      {editingPost && (
        <EditModal
          post={editingPost}
          userId={user.id}
          onClose={() => setEditingPost(null)}
          onSaved={() => handleEditSaved(editingPost.title)}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>My Posts</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          Manage your lost and found reports.
        </p>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#94A3B8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <EmptyIcon />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#475569' }}>No posts yet</div>
          <div style={{ fontSize: 14, marginTop: 4, marginBottom: 20 }}>
            Start by reporting a lost or found item
          </div>
          <Link to="/create" style={{ display: 'inline-block', padding: '10px 24px', background: DARK_RED, color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            Post an Item
          </Link>
        </div>
      ) : (
        <div>
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
                    onEdit={() => setEditingPost(post)}
                    onResolve={() => handleResolve(post.id, post.title)}
                    onDelete={() => handleDelete(post.id, post.title)}
                  />
                ))}
              </div>
            </div>
          )}

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
                    onEdit={() => setEditingPost(post)}
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
   PostCard
══════════════════════════════════════════ */
function PostCard({ post, onEdit, onResolve, onDelete }) {
  const isResolved = post.status === 'resolved'
  const isLost     = post.type === 'lost'
  const iconFn     = CAT_ICON[post.category] || CAT_ICON.Other
  const iconColor  = isResolved ? '#16A34A' : (CAT_COLOR[post.category] || '#475569')
  const iconBg     = isResolved ? '#F0FDF4' : (CAT_BG[post.category]   || '#F8FAFC')

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${isResolved ? '#D1FAE5' : '#E5E9F0'}`, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {post.image_url
            ? <img src={post.image_url} alt={post.title} style={{ width: 48, height: 48, objectFit: 'cover' }} />
            : iconFn(iconColor, 22)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post.title}
            </h3>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, flexShrink: 0, ...(isResolved ? { background: '#F0FDF4', color: '#166534' } : isLost ? { background: '#FEF2F2', color: '#991B1B' } : { background: '#F0FDF4', color: '#166534' }) }}>
              {isResolved && <CheckIcon />}
              {isResolved ? 'Resolved' : isLost ? 'Lost' : 'Found'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
            <PinIcon />
            {post.location} · {new Date(post.date_lost_found).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {post.description}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* View */}
        <Link to={`/post/${post.id}`} style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#F8FAFC', color: '#475569', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 500, border: '1px solid #E5E9F0' }}>
          View
        </Link>

        {/* Edit */}
        <button onClick={onEdit} style={{ flex: 1, padding: '8px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
          onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
          onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}
        >
          <EditIcon />
          Edit
        </button>

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