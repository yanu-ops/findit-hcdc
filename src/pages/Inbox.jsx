import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Inbox() {
  const { user, setUnreadCount } = useStore()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThreads()
  }, [])

  async function fetchThreads() {
    // Get all messages involving this user
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

    if (!messages) {
      setLoading(false)
      return
    }

    // Group by post_id + other user
    const threadMap = {}
    let unread = 0

    messages.forEach(msg => {
      const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
      const key = `${msg.post_id}_${otherUser.id}`

      if (!threadMap[key]) {
        threadMap[key] = {
          post: msg.posts,
          otherUser,
          lastMessage: msg,
          unreadCount: 0,
        }
      }

      if (!msg.is_read && msg.receiver_id === user.id) {
        threadMap[key].unreadCount++
        unread++
      }
    })

    setUnreadCount(unread)
    setThreads(Object.values(threadMap))
    setLoading(false)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Messages</h1>

      {threads.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">No messages yet</p>
          <p className="text-sm">Browse items and message a poster to start</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {threads.map((thread, i) => (
            <Link
              key={i}
              to={`/chat/${thread.post.id}/${thread.otherUser.id}`}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-all"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {thread.otherUser.full_name?.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-500 mb-0.5">
                  Re: {thread.post.title}
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px]
                    ${thread.post.type === 'lost' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {thread.post.type}
                  </span>
                </p>
                <p className="font-semibold text-sm text-slate-800">{thread.otherUser.full_name}</p>
                <p className="text-xs text-slate-400 truncate">{thread.lastMessage.content}</p>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-[10px] text-slate-400">
                  {new Date(thread.lastMessage.sent_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </p>
                {thread.unreadCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}