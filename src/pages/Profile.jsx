import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

const DARK_RED = '#8B0000'

export default function Profile() {
  const { user, profile, setProfile } = useStore()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [stats, setStats]         = useState({ total: 0, active: 0, resolved: 0 })
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [name, setName]           = useState(profile?.full_name || '')
  const [saving, setSaving]       = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview]     = useState(profile?.avatar_url || null)
  const [uploadError, setUploadError]         = useState('')

  useEffect(() => { fetchStats() }, [])
  useEffect(() => { setAvatarPreview(profile?.avatar_url || null) }, [profile?.avatar_url])

  async function fetchStats() {
    const { data } = await supabase
      .from('posts').select('status').eq('user_id', user.id)
    if (data) {
      setStats({
        total:    data.length,
        active:   data.filter(p => p.status === 'active').length,
        resolved: data.filter(p => p.status === 'resolved').length,
      })
    }
    setLoading(false)
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadError('')

    // Preview immediately
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)
    setAvatarUploading(true)

    try {
      // Upload to Supabase Storage
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('item-photos')
        .upload(path, file, { upsert: true })

      if (upErr) throw upErr

      const { data: urlData } = supabase.storage
        .from('item-photos')
        .getPublicUrl(path)

      const avatar_url = urlData.publicUrl + `?t=${Date.now()}` // bust cache

      const { data: updated, error: dbErr } = await supabase
        .from('users')
        .update({ avatar_url })
        .eq('id', user.id)
        .select()
        .single()

      if (dbErr) throw dbErr

      setProfile(updated)
      setAvatarPreview(avatar_url)
    } catch (err) {
      setUploadError('Upload failed. Please try again.')
      setAvatarPreview(profile?.avatar_url || null)
      console.error(err)
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    const { data } = await supabase
      .from('users').update({ full_name: name })
      .eq('id', user.id).select().single()
    if (data) setProfile(data)
    setEditing(false)
    setSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return <LoadingSpinner />

  const initials = profile?.full_name?.charAt(0).toUpperCase() || '?'

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', marginBottom: 24 }}>Profile</h1>

      {/* ── Profile card ── */}
      <div style={{
        background: '#fff', borderRadius: 20,
        border: '1.5px solid #E5E9F0',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden', marginBottom: 16,
      }}>
        {/* Header banner */}
        <div style={{
          height: 80,
          background: `linear-gradient(135deg, ${DARK_RED} 0%, #5A0010 100%)`,
        }} />

        {/* Avatar + info */}
        <div style={{ padding: '0 24px 24px', position: 'relative' }}>
          {/* Avatar circle — overlaps the banner */}
          <div style={{
            position: 'relative',
            width: 80, height: 80,
            marginTop: -40, marginBottom: 12,
          }}>
            {/* Avatar image or initials */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              background: '#1A56DB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 28 }}>
                  {initials}
                </span>
              )}
              {/* Uploading overlay */}
              {avatarUploading && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.45)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 24, height: 24,
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                </div>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              title="Change profile picture"
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 26, height: 26, borderRadius: '50%',
                background: DARK_RED, border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: avatarUploading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                transition: 'background 0.15s',
                opacity: avatarUploading ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!avatarUploading) e.currentTarget.style.background = '#6B0000' }}
              onMouseLeave={e => { if (!avatarUploading) e.currentTarget.style.background = DARK_RED }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 13, height: 13 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </button>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Upload error */}
          {uploadError && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              color: '#991B1B', borderRadius: 8,
              padding: '8px 12px', fontSize: 12,
              marginBottom: 10,
            }}>
              {uploadError}
            </div>
          )}

          {/* Name / edit */}
          {editing ? (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                border: '1.5px solid #E5E9F0', borderRadius: 10,
                padding: '8px 12px', fontSize: 16, fontWeight: 600,
                fontFamily: 'inherit', outline: 'none',
                marginBottom: 2, width: '100%', boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = DARK_RED; e.target.style.boxShadow = `0 0 0 3px rgba(139,0,0,0.08)` }}
              onBlur={e => { e.target.style.borderColor = '#E5E9F0'; e.target.style.boxShadow = 'none' }}
            />
          ) : (
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>
              {profile?.full_name}
            </h2>
          )}
          {profile?.student_id && (
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 2px' }}>{profile.student_id}</p>
          )}
          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{profile?.email}</p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: '1px solid #F1F5F9',
        }}>
          {[
            { label: 'Total Posts', value: stats.total },
            { label: 'Active',      value: stats.active },
            { label: 'Resolved',    value: stats.resolved },
          ].map(({ label, value }, i) => (
            <div key={label} style={{
              padding: '16px 12px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid #F1F5F9' : 'none',
            }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: DARK_RED, margin: 0 }}>{value}</p>
              <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Edit / Save */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F1F5F9' }}>
          {editing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSave} disabled={saving}
                style={{
                  flex: 1, padding: '10px',
                  background: saving ? '#94A3B8' : DARK_RED,
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#6B0000' }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = DARK_RED }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setEditing(false); setName(profile?.full_name || '') }}
                style={{
                  flex: 1, padding: '10px',
                  background: '#F8FAFC', color: '#475569',
                  border: '1.5px solid #E5E9F0', borderRadius: 10,
                  fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                width: '100%', padding: '10px',
                background: '#F8FAFC', color: '#0F172A',
                border: '1.5px solid #E5E9F0', borderRadius: 10,
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E0' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E5E9F0' }}
            >
              ✏️ Edit Name
            </button>
          )}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%', padding: '12px',
          background: '#FEF2F2', color: '#991B1B',
          border: '1.5px solid #FECACA', borderRadius: 12,
          fontSize: 14, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
        onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
      >
        Log Out
      </button>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}