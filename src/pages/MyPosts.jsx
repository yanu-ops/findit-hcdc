import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'
import Alert from '../components/Alert'

const DARK_RED = '#8B0000'

const CAT_ICON = {
  Electronics: '🎧', Clothing: '👕', 'ID / Cards': '🪪',
  Bags: '👜', Books: '📚', Keys: '🔑', Wallet: '👛', Other: '📦',
}

export default function MyPosts() {
  const { user } = useStore()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => { fetchMyPosts() }, [])

  function showAlert(type, text) {
    setAlert({ type, text })
  }

  async function fetchMyPosts() {
    const { data } = await supabase
      .from('posts').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function handleResolve(postId, title) {
    const { error } = await supabase
      .from('posts').update({ status: 'resolved' }).eq('id', postId)
    if (error) {
      showAlert('error', 'Failed to mark as resolved.')
    } else {
      showAlert('success', `"${title}" marked as Resolved.`)
      fetchMyPosts()
    }
  }

  async function handleDelete(postId, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      showAlert('error', 'Failed to delete post.')
    } else {
      showAlert('success', `"${title}" deleted successfully.`)
      fetchMyPosts()
    }
  }

  if (loading) return <LoadingSpinner />

  const active   = posts.filter(p => p.status === 'active')
  const resolved = posts.filter(p => p.status === 'resolved')

  return (
    <div>
      {alert && (
        <Alert
          message={alert.text}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>My Posts</h1>
        <p style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
          Manage your lost and found reports.
        </p>
      </div>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
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
          {active.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Active Posts
                </h2>
                <span style={{
                  background: '#FDF2F2', color: DARK_RED,
                  fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99,
                }}>
                  {active.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {active.map(post => (
                  <PostCard
                    key={post.id} post={post}
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
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Resolved Posts
                </h2>
                <span style={{
                  background: '#F0FDF4', color: '#166534',
                  fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 99,
                }}>
                  {resolved.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resolved.map(post => (
                  <PostCard
                    key={post.id} post={post}
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

function PostCard({ post, onResolve, onDelete }) {
  const icon = CAT_ICON[post.category] || '📦'
  const isResolved = post.status === 'resolved'
  const isLost = post.type === 'lost'

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: `1.5px solid ${isResolved ? '#D1FAE5' : '#E5E9F0'}`,
      padding: '16px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: isResolved ? '#F0FDF4' : '#FDF2F2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {post.image_url
            ? <img src={post.image_url} alt={post.title}
                style={{ width: 48, height: 48, objectFit: 'cover' }} />
            : <span style={{ fontSize: 22 }}>{icon}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <h3 style={{
              fontSize: 15, fontWeight: 600, color: '#0F172A',
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {post.title}
            </h3>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 10px', borderRadius: 99,
              fontSize: 11, fontWeight: 600, flexShrink: 0,
              ...(isResolved
                ? { background: '#F0FDF4', color: '#166534' }
                : isLost
                  ? { background: '#FEF2F2', color: '#991B1B' }
                  : { background: '#F0FDF4', color: '#166534' }),
            }}>
              {isResolved ? '✓ Resolved' : isLost ? 'Lost' : 'Found'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            📍 {post.location} · {new Date(post.date_lost_found).toLocaleDateString('en-PH', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: 13, color: '#64748B', margin: '0 0 14px',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {post.description}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Link to={`/post/${post.id}`} style={{
          flex: 1, textAlign: 'center', padding: '8px',
          background: '#F8FAFC', color: '#475569',
          borderRadius: 8, textDecoration: 'none',
          fontSize: 13, fontWeight: 500,
          border: '1px solid #E5E9F0',
        }}>
          View
        </Link>
        {!isResolved && onResolve && (
          <button
            onClick={onResolve}
            style={{
              flex: 1, padding: '8px',
              background: '#F0FDF4', color: '#166534',
              border: '1px solid #BBF7D0', borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#DCFCE7'}
            onMouseLeave={e => e.currentTarget.style.background = '#F0FDF4'}
          >
            ✓ Resolve
          </button>
        )}
        {/* Delete button always visible — on both active and resolved */}
        <button
          onClick={onDelete}
          style={{
            padding: '8px 14px',
            background: '#FEF2F2', color: '#991B1B',
            border: '1px solid #FECACA',
            borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
          onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ width: 14, height: 14 }}>
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  )
}