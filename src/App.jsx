import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import useStore from './store/useStore'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Browse from './pages/Browse'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import Inbox from './pages/Inbox'
import Chat from './pages/Chat'
import MyPosts from './pages/MyPosts'
import Profile from './pages/Profile'

export default function App() {
  const { setUser, setProfile, clearUser, setOnlineUsers, user } = useStore()

  useEffect(() => {
    // ── Initial session ──
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    // ── Auth state changes ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
        } else {
          clearUser()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Presence channel — starts once user is known ──
  useEffect(() => {
    if (!user?.id) return

    const presenceChannel = supabase.channel('app-presence', {
      config: { presence: { key: user.id } },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        // state keys are the presence keys (user IDs)
        setOnlineUsers(new Set(Object.keys(state)))
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => new Set([...prev, key]))
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: user.id, online_at: new Date().toISOString() })
        }
      })

    // ── Listen for users table changes to keep profile in sync ──
    const profileChannel = supabase
      .channel(`profile-sync-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => {
          setProfile(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(presenceChannel)
      supabase.removeChannel(profileChannel)
    }
  }, [user?.id])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Browse />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/chat/:postId/:userId" element={<Chat />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}