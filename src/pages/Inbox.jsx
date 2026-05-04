import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

/* ── Category SVG icons ─────────────────────────────────── */
const CAT_ICONS = {
  Electronics: (col, size) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-2l-2 4h-4l-2-4H4"/>
    </svg>
  ),
  Clothing: (col, size) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  ),
  'ID / Cards': (col, size) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 11h4M13 15h3"/>
    </svg>
  ),
  Bags: (col, size) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Books: (col, size) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Keys: (col, size) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  Wallet: (col, size) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
    </svg>
  ),
  Other: (col, size) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, flexShrink: 0 }}>
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

function getCatIcon(category, size = 13) {
  const fn  = CAT_ICONS[category] || CAT_ICONS.Other
  const col = CAT_COLOR[category] || CAT_COLOR.Other
  return fn(col, size)
}

/* ── Thread builder ─────────────────────────────────────── */
function buildThreads(messages, userId) {
  const threadMap = {}
  let unread = 0
  messages.forEach(msg => {
    const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender
    if (!otherUser) return
    const key = `${msg.post_id}_${otherUser.id}`
    if (!threadMap[key]) {
      threadMap[key] = {
        key,
        post: msg.posts,
        otherUser,
        lastMessage: msg,
        unreadCount: 0,
        postId: msg.post_id,
        otherUserId: otherUser.id,
      }
    }
    if (!msg.is_read && msg.receiver_id === userId) {
      threadMap[key].unreadCount++
      unread++
    }
  })
  return { threads: Object.values(threadMap), unread }
}

/* ── Main component ─────────────────────────────────────── */
export default function Inbox() {
  const { user, setUnreadCount, setNotifCount, setThreads, onlineUsers } = useStore()
  const navigate = useNavigate()
  const [threads, setLocalThreads] = useState([])
  const [loading, setLoading]      = useState(true)

  const fetchThreads = useCallback(async () => {
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        *,
        posts(id, title, type, status, category),
        sender:sender_id(id, full_name, avatar_url),
        receiver:receiver_id(id, full_name, avatar_url)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('sent_at', { ascending: false })

    if (!messages) { setLoading(false); return }
    const { threads: built, unread } = buildThreads(messages, user.id)
    setLocalThreads(built)
    setThreads(built)
    setUnreadCount(unread)
    setLoading(false)
  }, [user.id, setUnreadCount, setThreads])

  useEffect(() => {
    fetchThreads()

    const channel = supabase
      .channel(`inbox-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new
        if (msg.sender_id === user.id || msg.receiver_id === user.id) fetchThreads()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new
        if (msg.sender_id === user.id || msg.receiver_id === user.id) fetchThreads()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, () => {
        fetchThreads()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchThreads, user.id])

  async function handleThreadClick(thread) {
    if (thread.unreadCount > 0) {
      setLocalThreads(prev => {
        const next = prev.map(t => t.key === thread.key ? { ...t, unreadCount: 0 } : t)
        const newTotal = next.reduce((acc, t) => acc + t.unreadCount, 0)
        setUnreadCount(newTotal)
        setNotifCount(newTotal)
        return next
      })

      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('post_id', thread.postId)
        .eq('sender_id', thread.otherUserId)
        .eq('receiver_id', user.id)
        .eq('is_read', false)
    }
    navigate(`/chat/${thread.postId}/${thread.otherUserId}`)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Messages</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {threads.length > 0 ? `${threads.length} conversation${threads.length !== 1 ? 's' : ''}` : 'No conversations yet'}
        </p>
      </div>

      {threads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#94A3B8' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#475569', marginBottom: 4 }}>No messages yet</div>
          <div style={{ fontSize: 13 }}>Browse items and message a poster to get started</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {threads.map(thread => {
            const hasUnread    = thread.unreadCount > 0
            const isOnline     = onlineUsers.has(thread.otherUserId)
            const isLastFromMe = thread.lastMessage.sender_id === user.id
            const avatarUrl    = thread.otherUser.avatar_url
            const initial      = thread.otherUser.full_name?.charAt(0).toUpperCase() || '?'
            const isResolved   = thread.post?.status === 'resolved'
            const category     = thread.post?.category || 'Other'
            const catColor     = CAT_COLOR[category] || CAT_COLOR.Other
            const catBg        = CAT_BG[category]    || CAT_BG.Other

            return (
              <button
                key={thread.key}
                onClick={() => handleThreadClick(thread)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', textAlign: 'left',
                  background: hasUnread ? '#F0F7FF' : '#fff',
                  borderRadius: 16,
                  border: hasUnread ? '1.5px solid #BFDBFE' : '1.5px solid #F1F5F9',
                  padding: '14px 16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
              >
                {/* Avatar — green dot only when online */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, overflow: 'hidden' }}>
                    {avatarUrl
                      ? <img src={avatarUrl} alt={thread.otherUser.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : initial}
                  </div>
                  {isOnline && (
                    <span style={{
                      position: 'absolute', bottom: 1, right: 1,
                      width: 12, height: 12, borderRadius: '50%',
                      background: '#16A34A',
                      border: `2px solid ${hasUnread ? '#F0F7FF' : '#fff'}`,
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Row 1: name + timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: hasUnread ? 700 : 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {thread.otherUser.full_name}
                    </span>
                    <span style={{ fontSize: 11, color: hasUnread ? '#2563EB' : '#94A3B8', flexShrink: 0, marginLeft: 8, fontWeight: hasUnread ? 600 : 400 }}>
                      {formatTime(thread.lastMessage.sent_at)}
                    </span>
                  </div>

                  {/* Row 2: category icon + post title + resolved/type badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    {/* Category icon pill */}
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: isResolved ? '#F1F5F9' : catBg,
                      borderRadius: 99, padding: '2px 7px 2px 5px',
                      flexShrink: 0,
                    }}>
                      {isResolved
                        ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )
                        : getCatIcon(category, 12)
                      }
                      <span style={{ fontSize: 10, fontWeight: 600, color: isResolved ? '#64748B' : catColor }}>
                        {isResolved ? 'Resolved' : category}
                      </span>
                    </span>

                    {/* Post title */}
                    <span style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {thread.post?.title}
                    </span>
                  </div>

                  {/* Row 3: last message preview */}
                  <p style={{ fontSize: 13, color: hasUnread ? '#1E40AF' : '#64748B', fontWeight: hasUnread ? 500 : 400, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isLastFromMe ? <span style={{ color: '#94A3B8' }}>You: </span> : null}
                    {thread.lastMessage.content}
                  </p>
                </div>

                {/* Unread badge + chevron */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {hasUnread && (
                    <span style={{ background: '#2563EB', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 99, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                      {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                    </span>
                  )}
                  <svg viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function formatTime(ts) {
  const date = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString('en-PH', { weekday: 'short' })
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}