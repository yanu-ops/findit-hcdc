import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

const DARK_RED = '#8B0000'
const CATS = ['Electronics', 'Clothing', 'ID / Cards', 'Bags', 'Books', 'Keys', 'Wallet', 'Other']

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useStore()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    type: 'lost', title: '', category: 'Electronics',
    location: '', date_lost_found: new Date().toISOString().split('T')[0],
    description: '',
  })

  const update = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    let image_url = null
    if (imageFile) {
      const fn = `${user.id}/${Date.now()}-${imageFile.name}`
      const { data: upData, error: upErr } = await supabase.storage
        .from('item-photos').upload(fn, imageFile)
      if (upErr) { setError('Image upload failed. Please try again.'); setLoading(false); return }
      image_url = supabase.storage.from('item-photos').getPublicUrl(upData.path).data.publicUrl
    }

    const { error: postError } = await supabase.from('posts').insert({
      ...form, user_id: user.id, image_url,
    })

    if (postError) {
      setError(postError.message)
    } else {
      setSuccess(true)
      // Reset form
      setForm({
        type: 'lost', title: '', category: 'Electronics',
        location: '', date_lost_found: new Date().toISOString().split('T')[0],
        description: '',
      })
      setImageFile(null)
      setPreview(null)
      // Auto-navigate to browse after 2 seconds
      setTimeout(() => navigate('/'), 2000)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E5E7EB',
    borderRadius: 10, fontSize: 14, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    color: '#0F172A', background: '#fff',
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Report an Item
        </h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          Fill in the details and other students will be able to message you.
        </p>
      </div>

      {/* Success alert */}
      {success && (
        <div style={{
          background: '#F0FDF4', border: '1.5px solid #86EFAC',
          color: '#166534', borderRadius: 12, padding: '14px 16px',
          marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1 }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Post submitted successfully!</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>
              Your item is now visible to other students. Redirecting to Browse...
            </div>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1.5px solid #FECACA',
          color: '#991B1B', borderRadius: 12, padding: '14px 16px',
          marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ width: 18, height: 18, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1.5px solid #F1F5F9',
        padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {[
            { val: 'lost',  label: '😟 I Lost an Item'  },
            { val: 'found', label: '✋ I Found an Item' },
          ].map(({ val, label }) => (
            <button
              key={val}
              type="button"
              onClick={() => setForm(f => ({ ...f, type: val }))}
              style={{
                flex: 1, padding: '11px',
                borderRadius: 10, border: 'none',
                background: form.type === val
                  ? (val === 'lost' ? DARK_RED : '#15803D')
                  : '#F8FAFC',
                color: form.type === val ? '#fff' : '#475569',
                fontSize: 14, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
                boxShadow: form.type === val ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Item name */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Item Name *
            </label>
            <input type="text" required value={form.title} onChange={update('title')}
              placeholder="e.g. Black umbrella"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Category *
            </label>
            <select value={form.category} onChange={update('category')}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Location *
            </label>
            <input type="text" required value={form.location} onChange={update('location')}
              placeholder="e.g. Main Library, 2nd floor"
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Date */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Date *
            </label>
            <input type="date" required value={form.date_lost_found} onChange={update('date_lost_found')}
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Description *
            </label>
            <textarea required value={form.description} onChange={update('description')}
              rows={4}
              placeholder="Color, brand, distinguishing marks — be as specific as possible..."
              style={{ ...inputStyle, resize: 'none', height: 'auto', lineHeight: 1.6 }}
              onFocus={e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Photo */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 5 }}>
              Photo (optional)
            </label>
            <label style={{ display: 'block', cursor: 'pointer' }}>
              {preview ? (
                <img src={preview} alt="preview"
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10 }} />
              ) : (
                <div style={{
                  border: '2px dashed #E5E7EB', borderRadius: 10,
                  padding: '24px', textAlign: 'center',
                  color: '#94A3B8', transition: 'border-color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = DARK_RED}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                  <div style={{ fontSize: 13 }}>Click to upload a photo</div>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </label>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#94A3B8' : DARK_RED,
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6B0000' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = DARK_RED }}
          >
            {loading ? 'Submitting...' : 'Submit Post'}
          </button>
        </form>
      </div>
    </div>
  )
}