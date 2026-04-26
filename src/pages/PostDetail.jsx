import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

const DARK_RED = '#8B0000'
const CATS = ['Electronics', 'Clothing', 'ID / Cards', 'Bags', 'Books', 'Keys', 'Wallet', 'Other']

const CATEGORY_ICONS = {
  Electronics: '🎧', Clothing: '👕', 'ID / Cards': '🪪',
  Bags: '👜', Books: '📚', Keys: '🔑', Wallet: '👛', Other: '📦',
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  // Edit state
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
      .select('*, users(id, full_name, student_id)')
      .eq('id', id)
      .single()
    setPost(data)
    setLoading(false)
  }

  function openEdit() {
    setEditForm({
      type: post.type,
      title: post.title,
      category: post.category,
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

    const { error } = await supabase.from('posts').update({
      ...editForm,
      image_url,
    }).eq('id', id)

    if (error) {
      setEditError(error.message)
    } else {
      await fetchPost()
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleResolve() {
    if (!confirm('Mark this post as Resolved?')) return
    await supabase.from('posts').update({ status: 'resolved' }).eq('id', id)
    fetchPost()
  }

  async function handleMessage() {
    navigate(`/chat/${post.id}/${post.users.id}`)
  }

  if (loading) return <LoadingSpinner />
  if (!post) return <div className="text-center py-20 text-slate-400">Post not found.</div>

  const isOwner = user?.id === post.user_id
  const isResolved = post.status === 'resolved'
  const icon = CATEGORY_ICONS[post.category] || '📦'

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 10,
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    color: '#0F172A',
    background: '#F8FAFC',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }
  const onFocus = e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }
  const onBlur  = e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }
  const upd = k => e => setEditForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="max-w-lg mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit', padding: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
      >
        ← Back
      </button>

      {/* ── VIEW MODE ── */}
      {!editing && (
        <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>
          {/* Image */}
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} style={{ width: '100%', height: 208, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: 208, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>
              {icon}
            </div>
          )}

          <div style={{ padding: 24 }}>
            {/* Title row + status badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>{post.title}</h1>
              <span style={{
                flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                ...(isResolved
                  ? { background: '#F1F5F9', color: '#64748B' }
                  : post.type === 'lost'
                    ? { background: '#FEF2F2', color: '#991B1B' }
                    : { background: '#F0FDF4', color: '#166534' }),
              }}>
                {isResolved ? 'Resolved' : post.type === 'lost' ? 'Lost' : 'Found'}
              </span>
            </div>

            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, marginBottom: 20 }}>{post.description}</p>

            {/* Detail rows */}
            <div style={{ marginBottom: 20 }}>
              {[
                { label: 'Category', value: post.category },
                { label: 'Location', value: post.location },
                { label: 'Date',     value: new Date(post.date_lost_found).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9', fontSize: 14 }}>
                  <span style={{ color: '#94A3B8' }}>{label}</span>
                  <span style={{ color: '#0F172A', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Poster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#F8FAFC', borderRadius: 14, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1A56DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {post.users?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>{post.users?.full_name}</p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>Posted this item</p>
              </div>
            </div>

            {/* Actions */}
            {isResolved ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                  <p style={{ color: '#166534', fontWeight: 600, margin: 0, fontSize: 14 }}>✓ This item has been resolved</p>
                </div>
                {/* Owner can still edit even if resolved */}
                {isOwner && (
                  <button onClick={openEdit} style={{ width: '100%', padding: '12px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E5E9F0', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                    onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                  >
                    ✏️ Edit Post
                  </button>
                )}
              </div>
            ) : isOwner ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={handleResolve} style={{ width: '100%', padding: '12px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#15803D'}
                  onMouseLeave={e => e.currentTarget.style.background = '#16A34A'}
                >
                  ✓ Mark as Resolved
                </button>
                <button onClick={openEdit} style={{ width: '100%', padding: '12px', background: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E5E9F0', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F8FAFC'}
                >
                  ✏️ Edit Post
                </button>
              </div>
            ) : (
              <button onClick={handleMessage} style={{ width: '100%', padding: '12px', background: '#1A56DB', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1446B8'}
                onMouseLeave={e => e.currentTarget.style.background = '#1A56DB'}
              >
                💬 Message {post.users?.full_name?.split(' ')[0]}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── EDIT MODE ── */}
      {editing && (
        <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1.5px solid #F1F5F9', overflow: 'hidden' }}>
          {/* Edit header */}
          <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>Edit Post</h2>
            <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 20, lineHeight: 1, padding: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '16px 24px 24px' }}>
            {editError && (
              <div style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {editError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Type toggle */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { val: 'lost',  label: '😟 Lost'  },
                  { val: 'found', label: '✋ Found' },
                ].map(({ val, label }) => (
                  <button key={val} type="button"
                    onClick={() => setEditForm(f => ({ ...f, type: val }))}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: editForm.type === val ? (val === 'lost' ? DARK_RED : '#15803D') : '#F8FAFC', color: editForm.type === val ? '#fff' : '#475569', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Item Name *</label>
                <input type="text" required value={editForm.title} onChange={upd('title')} placeholder="e.g. Black umbrella" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Category *</label>
                <select value={editForm.category} onChange={upd('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Location */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Location *</label>
                <input type="text" required value={editForm.location} onChange={upd('location')} placeholder="e.g. Main Library, 2nd floor" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Date *</label>
                <input type="date" required value={editForm.date_lost_found} onChange={upd('date_lost_found')} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Description *</label>
                <textarea required value={editForm.description} onChange={upd('description')} rows={4}
                  placeholder="Color, brand, distinguishing marks..."
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              {/* Photo */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>Photo (optional)</label>
                <label style={{ display: 'block', cursor: 'pointer' }}>
                  {editPreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={editPreview} alt="preview" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                      >
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: 13, opacity: 0, transition: 'opacity 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >Click to change photo</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ border: '2px dashed #E5E7EB', borderRadius: 10, padding: '24px', textAlign: 'center', color: '#94A3B8', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = DARK_RED}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                    >
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                      <div style={{ fontSize: 13 }}>Click to upload a photo</div>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleEditImage} style={{ display: 'none' }} />
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
                <button type="button" onClick={() => setEditing(false)} style={{ flex: 1, padding: '12px', background: '#F8FAFC', color: '#475569', border: '1.5px solid #E5E9F0', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}