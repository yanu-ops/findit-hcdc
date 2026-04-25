import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORY_ICONS = {
  Electronics: '🎧', Clothing: '👕', 'ID / Cards': '🪪',
  Bags: '👜', Books: '📚', Other: '📦',
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useStore()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    const { data } = await supabase
      .from('posts')
      .select('*, users(id, full_name, student_id)')
      .eq('id', id)
      .single()
    setPost(data)
    setLoading(false)
  }

  async function handleResolve() {
    if (!confirm('Mark this post as Resolved?')) return
    await supabase.from('posts').update({ status: 'resolved' }).eq('id', id)
    fetchPost()
  }

  async function handleMessage() {
    // Navigate to chat with post owner
    navigate(`/chat/${post.id}/${post.users.id}`)
  }

  if (loading) return <LoadingSpinner />
  if (!post) return <div className="text-center py-20 text-slate-400">Post not found.</div>

  const isOwner = user?.id === post.user_id
  const isResolved = post.status === 'resolved'
  const icon = CATEGORY_ICONS[post.category] || '📦'

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
      >
        ← Back
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Image */}
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-slate-100 flex items-center justify-center text-7xl">
            {icon}
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold text-slate-800">{post.title}</h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full
              ${isResolved
                ? 'bg-slate-100 text-slate-500'
                : post.type === 'lost'
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'}`}>
              {isResolved ? 'Resolved' : post.type === 'lost' ? 'Lost' : 'Found'}
            </span>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed mb-5">{post.description}</p>

          {/* Details */}
          <div className="space-y-2 mb-5">
            {[
              { label: 'Category', value: post.category },
              { label: 'Location', value: post.location },
              { label: 'Date', value: new Date(post.date_lost_found).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span className="text-slate-400">{label}</span>
                <span className="text-slate-700 font-medium text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Poster */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-5">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {post.users?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{post.users?.full_name}</p>
              <p className="text-xs text-slate-400">Posted this item</p>
            </div>
          </div>

          {/* Actions */}
          {isResolved ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
              <p className="text-green-700 font-semibold">✓ This item has been resolved</p>
            </div>
          ) : isOwner ? (
            <button
              onClick={handleResolve}
              className="w-full bg-green-600 text-white font-semibold rounded-2xl py-3 hover:bg-green-700 transition-colors"
            >
              ✓ Mark as Resolved
            </button>
          ) : (
            <button
              onClick={handleMessage}
              className="w-full bg-blue-600 text-white font-semibold rounded-2xl py-3 hover:bg-blue-700 transition-colors"
            >
              💬 Message {post.users?.full_name?.split(' ')[0]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}