import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Chat() {
  const { postId, userId } = useParams()
  const navigate = useNavigate()
  const { user } = useStore()
  const [messages, setMessages] = useState([])
  const [post, setPost] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchData()
    markRead()

    // Subscribe to real-time messages
    const channel = supabase
      .channel(`chat-${postId}-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `post_id=eq.${postId}`,
      }, (payload) => {
        const msg = payload.new
        if (
          (msg.sender_id === user.id && msg.receiver_id === userId) ||
          (msg.sender_id === userId && msg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, msg])
          if (msg.receiver_id === user.id) markRead()
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [postId, userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchData() {
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

  async function markRead() {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('post_id', postId)
      .eq('sender_id', userId)
      .eq('receiver_id', user.id)
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim()) return

    const content = input.trim()
    setInput('')

    await supabase.from('messages').insert({
      post_id: postId,
      sender_id: user.id,
      receiver_id: userId,
      content,
    })
  }

  async function handleResolve() {
    if (!confirm('Mark this post as Resolved?')) return
    await supabase.from('posts').update({ status: 'resolved' }).eq('id', postId)
    setPost(p => ({ ...p, status: 'resolved' }))
  }

  if (loading) return <LoadingSpinner />

  const isOwner = user?.id === post?.user_id
  const isResolved = post?.status === 'resolved'

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700">←</button>
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {otherUser?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{otherUser?.full_name}</p>
          <p className="text-xs text-blue-500 truncate">
            {post?.type === 'lost' ? '🔴' : '🟢'} {post?.title}
          </p>
        </div>
        {isOwner && !isResolved && (
          <button
            onClick={handleResolve}
            className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium hover:bg-green-200 transition-colors"
          >
            ✓ Resolve
          </button>
        )}
      </div>

      {isResolved && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center text-sm text-green-700 font-medium mb-2">
          ✓ This item has been resolved
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 py-2">
        {messages.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            Say hi! Start the conversation to recover the item.
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isMe
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm'}`}>
                {msg.content}
                <div className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.sent_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-blue-600 text-white rounded-2xl px-5 font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}