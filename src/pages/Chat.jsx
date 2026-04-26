import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

const DARK_RED = '#8B0000'

export default function Chat() {
  const { postId, userId } = useParams()
  const navigate = useNavigate()
  const { user, setUnreadCount, setNotifCount } = useStore()

  const [messages, setMessages]   = useState([])
  const [post, setPost]           = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const bottomRef = useRef(null)
  const channelRef = useRef(null)

  // Mark all unread messages in this thread as read, then sync global counts
  const markRead = useCallback(async () => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('post_id', postId)
      .eq('sender_id', userId)
      .eq('receiver_id', user.id)
      .eq('is_read', false)

    // Re-fetch global unread count so Navbar badge and Inbox both update
    const { data } = await supabase
      .from('messages')
      .select('id')
      .eq('receiver_id', user.id)
      .eq('is_read', false)

    const total = data?.length ?? 0
    setUnreadCount(total)
    setNotifCount(total)
  }, [postId, userId, user.id, setUnreadCount, setNotifCount])

  useEffect(() => {
    async function init() {
      const [{ data: postData }, { data: userData }, { data: msgs }] = await Promise.all([
        supabase.from('posts').select('*').eq('id', postId).single(),
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase
          .from('messages')
          .select('*')
          .eq('post_id', postId)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
          .order('sent_at', { ascending: true }),
      ])
      setPost(postData)
      setOtherUser(userData)
      setMessages(msgs || [])
      setLoading(false)
    }

    init()
    markRead()

    // Real-time: new messages in this thread
    channelRef.current = supabase
      .channel(`chat-${postId}-${userId}-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const msg = payload.new
          const isRelevant =
            (msg.sender_id === user.id && msg.receiver_id === userId) ||
            (msg.sender_id === userId && msg.receiver_id === user.id)
          if (!isRelevant) return

          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })

          // If the incoming message is for us, mark it read immediately
          if (msg.receiver_id === user.id) {
            markRead()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const updated = payload.new
          setMessages(prev =>
            prev.map(m => m.id === updated.id ? { ...m, ...updated } : m)
          )
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [postId, userId, user.id, markRead])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    await supabase.from('messages').insert({
      post_id: postId,
      sender_id: user.id,
      receiver_id: userId,
      content,
    })
    setSending(false)
  }

  async function handleResolve() {
    if (!confirm('Mark this post as Resolved?')) return
    await supabase.from('posts').update({ status: 'resolved' }).eq('id', postId)
    setPost(p => ({ ...p, status: 'resolved' }))
  }

  if (loading) return <LoadingSpinner />

  const isOwner    = user?.id === post?.user_id
  const isResolved = post?.status === 'resolved'
  const initial    = otherUser?.full_name?.charAt(0).toUpperCase() || '?'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)' }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #F1F5F9', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', padding: '12px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 4, borderRadius: 8, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#0F172A'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748B'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Avatar */}
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {initial}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>{otherUser?.full_name}</p>
          <p style={{ fontSize: 12, color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ color: post?.type === 'lost' ? '#DC2626' : '#16A34A', marginRight: 4 }}>●</span>
            {post?.title}
          </p>
        </div>

        {isOwner && !isResolved && (
          <button
            onClick={handleResolve}
            style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.background = '#DCFCE7'}
            onMouseLeave={e => e.currentTarget.style.background = '#F0FDF4'}
          >
            ✓ Resolve
          </button>
        )}
      </div>

      {/* Resolved banner */}
      {isResolved && (
        <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 10 }}>
          ✓ This item has been resolved
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 2px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>
            Say hi! Start the conversation to recover the item.
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user.id
          const prevMsg = messages[idx - 1]
          const showDateSep = !prevMsg || !isSameDay(new Date(prevMsg.sent_at), new Date(msg.sent_at))

          return (
            <div key={msg.id}>
              {/* Date separator */}
              {showDateSep && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                  <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {formatDateSep(msg.sent_at)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: 14,
                  lineHeight: 1.5,
                  background: isMe ? '#2563EB' : '#fff',
                  color: isMe ? '#fff' : '#0F172A',
                  boxShadow: isMe ? '0 2px 8px rgba(37,99,235,0.25)' : '0 1px 4px rgba(0,0,0,0.07)',
                  border: isMe ? 'none' : '1.5px solid #F1F5F9',
                }}>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: 10, marginTop: 4, textAlign: 'right', color: isMe ? 'rgba(255,255,255,0.6)' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    {new Date(msg.sent_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                    {/* Read receipt for sent messages */}
                    {isMe && (
                      <svg viewBox="0 0 24 24" fill="none" stroke={msg.is_read ? '#93C5FD' : 'rgba(255,255,255,0.4)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1, background: '#fff', border: '1.5px solid #E5E9F0',
            borderRadius: 24, padding: '12px 18px', fontSize: 14,
            outline: 'none', fontFamily: 'inherit', color: '#0F172A',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.10)' }}
          onBlur={e => { e.target.style.borderColor = '#E5E9F0'; e.target.style.boxShadow = 'none' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          style={{
            background: !input.trim() || sending ? '#CBD5E1' : '#2563EB',
            color: '#fff', border: 'none', borderRadius: 24,
            padding: '12px 22px', fontSize: 14, fontWeight: 600,
            cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'background 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => { if (input.trim() && !sending) e.currentTarget.style.background = '#1D4ED8' }}
          onMouseLeave={e => { if (input.trim() && !sending) e.currentTarget.style.background = '#2563EB' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send
        </button>
      </form>
    </div>
  )
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function formatDateSep(ts) {
  const date = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}