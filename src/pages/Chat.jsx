import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '👍', '👎']

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

function getCatIcon(category, size = 12) {
  const fn  = CAT_ICONS[category] || CAT_ICONS.Other
  const col = CAT_COLOR[category] || CAT_COLOR.Other
  return fn(col, size)
}

/* ─── tiny helpers ─── */
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}
function formatDateSep(ts) {
  const d = new Date(ts), now = new Date()
  const diff = Math.floor((now - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}
function groupReactions(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const groups = {}
  Object.entries(raw).forEach(([key, emoji]) => {
    const uid = key.split('__')[1]
    if (!groups[emoji]) groups[emoji] = []
    groups[emoji].push(uid)
  })
  return groups
}

/* ─── Avatar ─── */
function Av({ url, name, size = 28 }) {
  const initial = name?.charAt(0).toUpperCase() || '?'
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#2563EB', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.38 }}>
      {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
    </div>
  )
}

/* ─── Lightbox ─── */
function Lightbox({ src, onClose }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 38, height: 38, color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
      <img src={src} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '88vh', borderRadius: 12, objectFit: 'contain' }} />
    </div>
  )
}

/* ─── Reaction tooltip ─── */
function ReactionTooltip({ names }) {
  if (!names?.length) return null
  const label = names.length === 1 ? names[0]
    : names.length === 2 ? `${names[0]} and ${names[1]}`
    : `${names[0]}, ${names[1]} and ${names.length - 2} more`
  return (
    <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6, background: 'rgba(15,23,42,0.92)', color: '#fff', fontSize: 11, fontWeight: 500, padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap', zIndex: 100, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
      {label}
      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(15,23,42,0.92)' }} />
    </div>
  )
}

/* ─── Quote strip above input ─── */
function QuoteStrip({ msg, myId, otherName, onCancel }) {
  const isFromMe = msg.sender_id === myId
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 12, padding: '8px 12px', marginBottom: 8 }}>
      <div style={{ width: 3, borderRadius: 99, background: '#2563EB', alignSelf: 'stretch', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', margin: '0 0 2px' }}>{isFromMe ? 'You' : otherName}</p>
        {msg.image_url && !msg.content
          ? <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>📷 Photo</p>
          : <p style={{ fontSize: 12, color: '#64748B', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.content}</p>}
      </div>
      <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 18, padding: 0, lineHeight: 1 }}>✕</button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function Chat() {
  const { postId, userId } = useParams()
  const navigate  = useNavigate()
  const { user, profile, setUnreadCount, setNotifCount, onlineUsers } = useStore()

  const [messages, setMessages]         = useState([])
  const [post, setPost]                 = useState(null)
  const [otherUser, setOtherUser]       = useState(null)
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(true)
  const [sending, setSending]           = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [replyTo, setReplyTo]           = useState(null)
  const [lightbox, setLightbox]         = useState(null)
  const [hoveredMsg, setHoveredMsg]     = useState(null)
  const [reactionPickerFor, setReactionPickerFor] = useState(null)
  const [tooltip, setTooltip]           = useState(null)

  const bottomRef   = useRef(null)
  const scrollRef   = useRef(null)
  const channelRef  = useRef(null)
  const fileRef     = useRef(null)
  const pickerRef   = useRef(null)
  const msgCountRef = useRef(0)

  const isOtherOnline = onlineUsers?.has?.(userId) ?? false

  function isNearBottom() {
    const el = scrollRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  function scrollToBottom(smooth = true) {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }

  /* ── Mark read ── */
  const markRead = useCallback(async () => {
    await supabase.from('messages').update({ is_read: true })
      .eq('post_id', postId).eq('sender_id', userId)
      .eq('receiver_id', user.id).eq('is_read', false)
    const { data } = await supabase.from('messages').select('id')
      .eq('receiver_id', user.id).eq('is_read', false)
    const n = data?.length ?? 0
    setUnreadCount(n); setNotifCount(n)
  }, [postId, userId, user.id, setUnreadCount, setNotifCount])

  /* ── Init + realtime ── */
  useEffect(() => {
    async function init() {
      const [{ data: postData }, { data: userData }, { data: msgs }] = await Promise.all([
        supabase.from('posts').select('*').eq('id', postId).single(),
        supabase.from('users').select('*').eq('id', userId).single(),
        supabase.from('messages').select('*').eq('post_id', postId)
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
          .order('sent_at', { ascending: true }),
      ])
      setPost(postData)
      setOtherUser(userData)
      setMessages(msgs || [])
      msgCountRef.current = (msgs || []).length
      setLoading(false)
      setTimeout(() => scrollToBottom(false), 50)
    }
    init()
    markRead()

    channelRef.current = supabase
      .channel(`chat-${postId}-${userId}-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `post_id=eq.${postId}` }, ({ new: msg }) => {
        const rel = (msg.sender_id === user.id && msg.receiver_id === userId) ||
                    (msg.sender_id === userId && msg.receiver_id === user.id)
        if (!rel) return
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        if (msg.receiver_id === user.id) markRead()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `post_id=eq.${postId}` }, ({ new: updated }) => {
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m))
      })
      .subscribe()

    const userCh = supabase.channel(`chat-user-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` }, ({ new: u }) => setOtherUser(u))
      .subscribe()

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
      supabase.removeChannel(userCh)
    }
  }, [postId, userId, user.id, markRead])

  /* ── Scroll only when message COUNT increases ── */
  useEffect(() => {
    if (messages.length > msgCountRef.current) {
      msgCountRef.current = messages.length
      if (isNearBottom()) scrollToBottom(true)
    }
  }, [messages])

  /* Close picker on outside click */
  useEffect(() => {
    if (!reactionPickerFor) return
    function fn(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setReactionPickerFor(null)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [reactionPickerFor])

  /* ── Image pick ── */
  function handleImagePick(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }
  function clearImage() { setImageFile(null); setImagePreview(null) }

  /* ── Send ── */
  async function sendMessage(e) {
    e.preventDefault()
    if ((!input.trim() && !imageFile) || sending || isResolved) return
    setSending(true)

    let image_url = null
    if (imageFile) {
      setUploading(true)
      const fn = `chat/${user.id}/${Date.now()}-${imageFile.name}`
      const { data: up, error: upErr } = await supabase.storage.from('item-photos').upload(fn, imageFile)
      if (!upErr) image_url = supabase.storage.from('item-photos').getPublicUrl(up.path).data.publicUrl
      setUploading(false)
    }

    const payload = {
      post_id: postId, sender_id: user.id, receiver_id: userId,
      content: input.trim() || '',
      image_url,
      reply_to_id: replyTo?.id ?? null,
      reactions: {},
    }
    setInput(''); clearImage(); setReplyTo(null); setSending(false)
    await supabase.from('messages').insert(payload)
  }

  /* ── React ── */
  async function addReaction(msgId, emoji) {
    setReactionPickerFor(null)
    const msg = messages.find(m => m.id === msgId)
    if (!msg) return
    const current = msg.reactions || {}
    const userKey = `${emoji}__${user.id}`
    const updated = { ...current }
    if (updated[userKey]) {
      delete updated[userKey]
    } else {
      Object.keys(updated).forEach(k => { if (k.endsWith(`__${user.id}`)) delete updated[k] })
      updated[userKey] = emoji
    }
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: updated } : m))
    await supabase.from('messages').update({ reactions: updated }).eq('id', msgId)
  }

  /* ── Resolve ── */
  async function handleResolve() {
    if (!confirm('Mark this post as Resolved?')) return
    await supabase.from('posts').update({ status: 'resolved' }).eq('id', postId)
    setPost(p => ({ ...p, status: 'resolved' }))
  }

  if (loading) return <LoadingSpinner />

  const isOwner    = user?.id === post?.user_id
  const isResolved = post?.status === 'resolved'
  const msgMap     = Object.fromEntries(messages.map(m => [m.id, m]))
  const category   = post?.category || 'Other'
  const catColor   = CAT_COLOR[category] || CAT_COLOR.Other
  const catBg      = CAT_BG[category]    || CAT_BG.Other

  const lastSeenIdx = (() => {
    for (let i = messages.length - 1; i >= 0; i--)
      if (messages[i].sender_id === user.id && messages[i].is_read) return i
    return -1
  })()

  const myAvatar = profile?.avatar_url
  const myName   = profile?.full_name || 'Me'
  const otAvatar = otherUser?.avatar_url
  const otName   = otherUser?.full_name || '?'

  return (
    <div style={{
      maxWidth: 900,
      width: '100%',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 8rem)',
      fontFamily: 'DM Sans, sans-serif',
    }}>

      {/* ── Header ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #F1F5F9', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', padding: '12px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', padding: 4, borderRadius: 8 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        {/* Avatar with online dot only — no text label */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Av url={otAvatar} name={otName} size={42} />
          <span style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: isOtherOnline ? '#16A34A' : '#94A3B8', border: '2.5px solid #fff' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name only — no online/offline text */}
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 3px' }}>{otName}</p>

          {/* Category icon + post title — replaces the red/green dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: catBg, borderRadius: 99,
              padding: '1px 7px 1px 5px', flexShrink: 0,
            }}>
              {getCatIcon(category, 11)}
              <span style={{ fontSize: 10, fontWeight: 600, color: catColor }}>{category}</span>
            </span>
            <span style={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {post?.title}
            </span>
          </div>
        </div>

        {isOwner && !isResolved && (
          <button onClick={handleResolve}
            style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 99, padding: '7px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.background = '#DCFCE7'}
            onMouseLeave={e => e.currentTarget.style.background = '#F0FDF4'}
          >✓ Resolve</button>
        )}
      </div>

      {/* ── Resolved banner ── */}
      {isResolved && (
        <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: 12, padding: '10px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 10, flexShrink: 0 }}>
          ✓ This item has been resolved
        </div>
      )}

      {/* ── Messages scroll container ── */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 8px' }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>
            Say hi! Start the conversation to recover the item.
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe       = msg.sender_id === user.id
          const prevMsg    = messages[idx - 1]
          const showDate   = !prevMsg || !isSameDay(new Date(prevMsg.sent_at), new Date(msg.sent_at))
          const isLastSeen = isMe && idx === lastSeenIdx
          const quotedMsg  = msg.reply_to_id ? msgMap[msg.reply_to_id] : null
          const reactions  = groupReactions(msg.reactions)
          const hasReact   = Object.keys(reactions).length > 0
          const isHovered  = hoveredMsg === msg.id

          return (
            <div key={msg.id}>
              {/* Date separator */}
              {showDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 8px' }}>
                  <div style={{ flex: 1, height: 1, background: '#E5E9F0' }} />
                  <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap', background: '#F8F9FB', padding: '2px 10px', borderRadius: 99, border: '1px solid #E5E9F0' }}>
                    {formatDateSep(msg.sent_at)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#E5E9F0' }} />
                </div>
              )}

              {/* Message row */}
              <div
                onMouseEnter={() => setHoveredMsg(msg.id)}
                onMouseLeave={() => { setHoveredMsg(null); setTooltip(null) }}
                style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: isMe ? 'flex-end' : 'flex-start', padding: '2px 4px', marginBottom: hasReact ? 10 : 2 }}
              >
                {/* Other avatar */}
                {!isMe && <Av url={otAvatar} name={otName} size={32} />}

                {/* Action bar LEFT (my messages) */}
                {isMe && !isResolved && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
                    <button
                      onClick={() => setReplyTo(msg)}
                      title="Reply"
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                        <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setReactionPickerFor(reactionPickerFor === msg.id ? null : msg.id)}
                      title="React"
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
                    >😊</button>
                  </div>
                )}

                {/* Bubble column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '68%' }}>

                  {/* Quote block */}
                  {quotedMsg && (
                    <div
                      onClick={() => document.getElementById(`msg-${quotedMsg.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      style={{
                        cursor: 'pointer', marginBottom: 2, padding: '8px 12px',
                        borderRadius: '12px 12px 0 0',
                        borderLeft: `4px solid ${isMe ? '#93C5FD' : '#2563EB'}`,
                        background: isMe ? '#1D4ED8' : '#E8F0FE',
                        maxWidth: '100%',
                        boxShadow: isMe ? 'inset 0 0 0 1px rgba(255,255,255,0.12)' : 'inset 0 0 0 1px #BFDBFE',
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 700, margin: '0 0 3px', color: isMe ? '#BFDBFE' : '#1D4ED8' }}>
                        {quotedMsg.sender_id === user.id ? 'You' : otName}
                      </p>
                      {quotedMsg.image_url && !quotedMsg.content ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <img src={quotedMsg.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: isMe ? '#CBD5E1' : '#475569' }}>📷 Photo</span>
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280, color: isMe ? '#E2E8F0' : '#334155', fontWeight: 500 }}>
                          {quotedMsg.content}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    id={`msg-${msg.id}`}
                    style={{
                      padding: (msg.image_url && !msg.content) ? 4 : '11px 16px',
                      borderRadius: quotedMsg
                        ? (isMe ? '0 16px 4px 16px' : '16px 0 16px 4px')
                        : (isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'),
                      background: isMe ? '#2563EB' : '#fff',
                      color: isMe ? '#fff' : '#0F172A',
                      fontSize: 14, lineHeight: 1.55,
                      boxShadow: isMe ? '0 2px 10px rgba(37,99,235,0.25)' : '0 1px 4px rgba(0,0,0,0.08)',
                      border: isMe ? 'none' : '1.5px solid #E5E9F0',
                    }}
                  >
                    {msg.image_url && (
                      <img
                        src={msg.image_url} alt="media"
                        onClick={() => setLightbox(msg.image_url)}
                        style={{ display: 'block', maxWidth: 260, maxHeight: 260, borderRadius: 10, objectFit: 'cover', cursor: 'zoom-in', marginBottom: msg.content ? 8 : 0 }}
                      />
                    )}
                    {msg.content && <span>{msg.content}</span>}
                    <div style={{ fontSize: 10, marginTop: 5, textAlign: 'right', color: isMe ? 'rgba(255,255,255,0.5)' : '#94A3B8' }}>
                      {new Date(msg.sent_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Reaction chips */}
                  {hasReact && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      {Object.entries(reactions).map(([emoji, uids]) => {
                        const iMine    = uids.includes(user.id)
                        const names    = uids.map(uid => uid === user.id ? 'You' : otName)
                        const isHovTip = tooltip?.msgId === msg.id && tooltip?.emoji === emoji
                        return (
                          <div key={`${msg.id}-${emoji}`} style={{ position: 'relative' }}>
                            {isHovTip && <ReactionTooltip names={names} />}
                            <button
                              onMouseEnter={() => setTooltip({ msgId: msg.id, emoji })}
                              onMouseLeave={() => setTooltip(null)}
                              onClick={() => addReaction(msg.id, emoji)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, border: iMine ? '1.5px solid #2563EB' : '1.5px solid #E5E9F0', background: iMine ? '#EFF6FF' : '#F8FAFC', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: iMine ? '#1D4ED8' : '#475569', transition: 'all 0.12s' }}
                            >
                              <span>{emoji}</span>
                              <span style={{ fontSize: 11 }}>{uids.length}</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Seen */}
                  {isLastSeen && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#2563EB', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 8, flexShrink: 0 }}>
                        {otAvatar ? <img src={otAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : otName.charAt(0)}
                      </div>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>Seen</span>
                    </div>
                  )}
                </div>

                {/* Action bar RIGHT (other's messages) */}
                {!isMe && !isResolved && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
                    <button
                      onClick={() => setReactionPickerFor(reactionPickerFor === msg.id ? null : msg.id)}
                      title="React"
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, transition: 'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
                    >😊</button>
                    <button
                      onClick={() => setReplyTo(msg)}
                      title="Reply"
                      style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                        <polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* My avatar */}
                {isMe && <Av url={myAvatar} name={myName} size={32} />}
              </div>

              {/* Emoji picker inline below the row */}
              {reactionPickerFor === msg.id && (
                <div
                  ref={pickerRef}
                  style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', padding: '0 52px 8px' }}
                >
                  <div style={{ background: '#fff', border: '1.5px solid #E5E9F0', borderRadius: 99, boxShadow: '0 6px 24px rgba(0,0,0,0.14)', padding: '7px 14px', display: 'flex', gap: 6 }}>
                    {REACTION_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(msg.id, emoji)}
                        style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, padding: '2px 4px', lineHeight: 1, transition: 'transform 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.35)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >{emoji}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area — replaced with ended notice when resolved ── */}
      <div style={{ flexShrink: 0, marginTop: 10 }}>
        {isResolved ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#F8FAFC', border: '1.5px solid #E5E9F0',
            borderRadius: 16, padding: '16px 20px',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500 }}>
              This conversation has ended — the item was marked as resolved.
            </span>
          </div>
        ) : (
          <>
            {/* Reply strip */}
            {replyTo && (
              <QuoteStrip msg={replyTo} myId={user.id} otherName={otName} onCancel={() => setReplyTo(null)} />
            )}

            {/* Image preview */}
            {imagePreview && (
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                <img src={imagePreview} alt="preview" style={{ height: 80, width: 80, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #E5E9F0', display: 'block' }} />
                <button onClick={clearImage} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#DC2626', border: '2px solid #fff', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
              </div>
            )}

            <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {/* Attach */}
              <button type="button" onClick={() => fileRef.current?.click()}
                style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', background: '#F8FAFC', border: '1.5px solid #E5E9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#2563EB' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B' }}
                title="Attach photo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />

              {/* Text */}
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                placeholder={imageFile ? 'Add a caption…' : 'Type a message…'}
                style={{ flex: 1, background: '#fff', border: '1.5px solid #E5E9F0', borderRadius: 24, padding: '12px 20px', fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#0F172A', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.10)' }}
                onBlur={e => { e.target.style.borderColor = '#E5E9F0'; e.target.style.boxShadow = 'none' }}
              />

              {/* Send */}
              <button type="submit" disabled={(!input.trim() && !imageFile) || sending}
                style={{ flexShrink: 0, width: 42, height: 42, borderRadius: '50%', background: (!input.trim() && !imageFile) || sending ? '#CBD5E1' : '#2563EB', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!input.trim() && !imageFile) || sending ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (input.trim() || imageFile) e.currentTarget.style.background = '#1D4ED8' }}
                onMouseLeave={e => { e.currentTarget.style.background = (!input.trim() && !imageFile) || sending ? '#CBD5E1' : '#2563EB' }}
              >
                {uploading
                  ? <div style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                }
              </button>
            </form>
          </>
        )}
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}