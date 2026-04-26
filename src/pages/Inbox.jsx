import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

const DARK_RED = '#8B0000'

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

export default function Inbox() {
  const { user, setUnreadCount, setThreads } = useStore()
  const navigate = useNavigate()
  const [threads, setLocalThreads] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchThreads = useCallback(async () => {
    const { data: messages } = await supabase
      .from('messages')
      .select(`
        *,
        posts(id, title, type, status),
        sender:sender_id(id, full_name),
        receiver:receiver_id(id, full_name)
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

    // Real-time: listen for any new INSERT or UPDATE on messages involving this user
    const channel = supabase
      .channel(`inbox-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            fetchThreads()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new
          if (msg.sender_id === user.id || msg.receiver_id === user.id) {
            fetchThreads()
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetchThreads, user.id])

  async function handleThreadClick(thread) {
    // Optimistically clear the unread dot before navigating
    if (thread.unreadCount > 0) {
      setLocalThreads(prev =>
        prev.map(t =>
          t.key === thread.key ? { ...t, unreadCount: 0 } : t
        )
      )
      // Recompute global unread
      const newTotal = threads.reduce((acc, t) =>
        t.key === thread.key ? acc : acc + t.unreadCount, 0
      )
      setUnreadCount(newTotal)

      // Mark all messages in this thread as read in DB
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
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Messages</h1>
        <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
          {threads.length > 0
            ? `${threads.length} conversation${threads.length !== 1 ? 's' : ''}`
            : 'No conversations yet'}
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
            const hasUnread = thread.unreadCount > 0
            const isLastFromMe = thread.lastMessage.sender_id === user.id
            const initial = thread.otherUser.full_name?.charAt(0).toUpperCase() || '?'

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
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'box-shadow 0.15s, border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'
                  e.currentTarget.style.borderColor = hasUnread ? '#93C5FD' : '#E2E8F0'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                  e.currentTarget.style.borderColor = hasUnread ? '#BFDBFE' : '#F1F5F9'
                }}
              >
                {/* Avatar with unread dot */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: hasUnread ? '#2563EB' : '#64748B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 16,
                    transition: 'background 0.15s',
                  }}>
                    {initial}
                  </div>
                  {/* Blue dot */}
                  {hasUnread && (
                    <span style={{
                      position: 'absolute', bottom: 1, right: 1,
                      width: 11, height: 11, borderRadius: '50%',
                      background: '#2563EB',
                      border: '2px solid #F0F7FF',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Top row: name + time */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{
                      fontSize: 14, fontWeight: hasUnread ? 700 : 600,
                      color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {thread.otherUser.full_name}
                    </span>
                    <span style={{ fontSize: 11, color: hasUnread ? '#2563EB' : '#94A3B8', flexShrink: 0, marginLeft: 8, fontWeight: hasUnread ? 600 : 400 }}>
                      {formatTime(thread.lastMessage.sent_at)}
                    </span>
                  </div>

                  {/* Post label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{
                      fontSize: 11, color: '#64748B',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      Re: {thread.post?.title}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99, flexShrink: 0,
                      ...(thread.post?.type === 'lost'
                        ? { background: '#FEF2F2', color: '#991B1B' }
                        : { background: '#F0FDF4', color: '#166534' }),
                    }}>
                      {thread.post?.type}
                    </span>
                  </div>

                  {/* Last message preview */}
                  <p style={{
                    fontSize: 13,
                    color: hasUnread ? '#1E40AF' : '#64748B',
                    fontWeight: hasUnread ? 500 : 400,
                    margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {isLastFromMe ? (
                      <span style={{ color: '#94A3B8' }}>You: </span>
                    ) : null}
                    {thread.lastMessage.content}
                  </p>
                </div>

                {/* Unread badge */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {hasUnread && (
                    <span style={{
                      background: '#2563EB', color: '#fff',
                      fontSize: 11, fontWeight: 700,
                      borderRadius: 99, minWidth: 20, height: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 5px',
                    }}>
                      {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                    </span>
                  )}
                  {/* Chevron */}
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
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-PH', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
  }
}