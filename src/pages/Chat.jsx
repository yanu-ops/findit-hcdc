import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Chat() {
  const { postId, userId } = useParams()
  const navigate = useNavigate()
  const { user, profile, setUnreadCount, setNotifCount, onlineUsers } = useStore()

  const [messages, setMessages]   = useState([])
  const [post, setPost]           = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [sending, setSending]     = useState(false)
  const bottomRef  = useRef(null)
  const channelRef = useRef(null)

  const isOtherOnline = onlineUsers.has(userId)

  const markRead = useCallback(async () => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('post_id', postId)
      .eq('sender_id', userId)
      .eq('receiver_id', user.id)
      .eq('is_read', false)

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

    // ── Messages realtime ──
    channelRef.current = supabase
      .channel(`chat-${postId}-${userId}-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `post_id=eq.${postId}` },
        (payload) => {
          const msg = payload.new
          const isRelevant =
            (msg.sender_id === user.id && msg.receiver_id === userId) ||
            (msg.sender_id === userId && msg.receiver_id === user.id)
          if (!isRelevant) return
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
          if (msg.receiver_id === user.id) markRead()
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `post_id=eq.${postId}` },
        (payload) => {
          const updated = payload.new
          setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m))
        }
      )
      .subscribe()

    // ── Other user profile realtime (avatar sync) ──
    const userChannel = supabase
      .channel(`chat-user-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
        (payload) => setOtherUser(payload.new)
      )
      .subscribe()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
      supabase.removeChannel(userChannel)
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

  // Find the index of the last message sent by me that the other person has read
  const lastSeenIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender_id === user.id && messages[i].is_read) return i
    }
    return -1
  })()

  // Avatar helpers
  const myAvatar     = profile?.avatar_url
  const myInitial    = profile?.full_name?.charAt(0).toUpperCase() || '?'
  const otherAvatar  = otherUser?.avatar_url
  const otherInitial = otherUser?.full_name?.charAt(0).toUpperCase() || '?'

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

        {/* Other user avatar with online dot */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, overflow: 'hidden' }}>
            {otherAvatar
              ? <img src={otherAvatar} alt={otherUser?.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : otherInitial}
          </div>
          {/* Online / Offline dot */}
          <span style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 11, height: 11, borderRadius: '50%',
            background: isOtherOnline ? '#16A34A' : '#DC2626',
            border: '2px solid #fff',
            transition: 'background 0.3s',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>{otherUser?.full_name}</p>
            <span style={{ fontSize: 11, fontWeight: 500, color: isOtherOnline ? '#16A34A' : '#DC2626' }}>
              {isOtherOnline ? '● Online' : '● Offline'}
            </span>
          </div>
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
        <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#166634', marginBottom: 10 }}>
          ✓ This item has been resolved
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 2px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>
            Say hi! Start the conversation to recover the item.
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe       = msg.sender_id === user.id
          const prevMsg    = messages[idx - 1]
          const showDateSep = !prevMsg || !isSameDay(new Date(prevMsg.sent_at), new Date(msg.sent_at))
          const isLastSeen  = isMe && idx === lastSeenIdx

          return (
            <div key={msg.id}>
              {/* Date separator */}
              {showDateSep && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 6px' }}>
                  <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                  <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {formatDateSep(msg.sent_at)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                </div>
              )}

              {/* Bubble row */}
              <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 7 }}>
                {/* Other person avatar (left side) */}
                {!isMe && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0, overflow: 'hidden', marginBottom: 2 }}>
                    {otherAvatar
                      ? <img src={otherAvatar} alt={otherUser?.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : otherInitial}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: 14, lineHeight: 1.5,
                    background: isMe ? '#2563EB' : '#fff',
                    color: isMe ? '#fff' : '#0F172A',
                    boxShadow: isMe ? '0 2px 8px rgba(37,99,235,0.2)' : '0 1px 4px rgba(0,0,0,0.07)',
                    border: isMe ? 'none' : '1.5px solid #F1F5F9',
                  }}>
                    {msg.content}
                    <div style={{ fontSize: 10, marginTop: 4, textAlign: 'right', color: isMe ? 'rgba(255,255,255,0.55)' : '#94A3B8' }}>
                      {new Date(msg.sent_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* ── Seen indicator — shows below the last message they've read ── */}
                  {isLastSeen && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, marginRight: 2 }}>
                      {/* Other user's mini avatar */}
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 8, overflow: 'hidden', flexShrink: 0 }}>
                        {otherAvatar
                          ? <img src={otherAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : otherInitial}
                      </div>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>Seen</span>
                    </div>
                  )}
                </div>

                {/* My avatar (right side) */}
                {isMe && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0, overflow: 'hidden', marginBottom: 2 }}>
                    {myAvatar
                      ? <img src={myAvatar} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : myInitial}
                  </div>
                )}
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
  const now  = new Date()
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}