import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

const DR      = '#8B0000'
const W       = '#FFFFFF'
const W70     = 'rgba(255,255,255,0.70)'
const W50     = 'rgba(255,255,255,0.50)'
const W25     = 'rgba(255,255,255,0.25)'
const W15     = 'rgba(255,255,255,0.15)'
const WB      = 'rgba(255,255,255,0.12)'
const WIDE    = 260
const NARROW  = 72
const EASE    = 'cubic-bezier(0.4,0,0.2,1)'
const DUR     = '0.28s'
const TR      = `${DUR} ${EASE}`

function useBreakpoint() {
  const get = () => window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const fn = () => setBp(get())
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return bp
}

const SB = [
  {
    to: '/', label: 'Browse',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  },
  {
    to: '/inbox', label: 'Messages', badge: true,
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
  {
    to: '/create', label: 'Post Item',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  },
  {
    to: '/my-posts', label: 'My Posts',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    to: '/profile', label: 'Profile',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
]

const BN = [
  {
    to: '/', label: 'Browse',
    icon: (col) => <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 23, height: 23 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  },
  {
    to: '/inbox', label: 'Messages', badge: true,
    icon: (col) => <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 23, height: 23 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  },
  {
    to: '/my-posts', label: 'My Posts',
    icon: (col) => <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 23, height: 23 }}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  },
  {
    to: '/profile', label: 'Profile',
    icon: (col) => <svg viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 23, height: 23 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
]

export default function Navbar() {
  const bp       = useBreakpoint()
  const isMobile = bp === 'mobile'
  const location = useLocation()
  const navigate = useNavigate()
  const { unreadCount, profile, notifCount, setNotifCount, setUnreadCount } = useStore()

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('sb-collapsed') === 'true' } catch { return false }
  })

  useEffect(() => {
    try { localStorage.setItem('sb-collapsed', collapsed) } catch {}
    window.dispatchEvent(new CustomEvent('sb-toggle', { detail: isMobile ? 'mobile' : collapsed }))
  }, [collapsed, isMobile])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sb-toggle', { detail: isMobile ? 'mobile' : collapsed }))
  }, [isMobile])

  const [showNotif, setShowNotif]         = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef                          = useRef(null)

  useEffect(() => {
    if (!profile?.id) return
    fetchNotifs()
    const ch = supabase
      .channel(`notif-${profile.id}`)
      // New message → show in notif list
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` }, fetchNotifs)
      // Message marked read (from Inbox or Chat) → re-fetch so badge clears immediately
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` }, fetchNotifs)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [profile?.id])

  useEffect(() => {
    const fn = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  async function fetchNotifs() {
    if (!profile?.id) return
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(full_name), posts(title)')
      .eq('receiver_id', profile.id)
      .eq('is_read', false)
      .order('sent_at', { ascending: false })
      .limit(20)
    const list = (data || []).map(m => ({
      id: m.id,
      text: `${m.sender?.full_name} sent you a message`,
      sub: `Re: ${m.posts?.title || 'an item'}`,
      time: m.sent_at,
      link: `/chat/${m.post_id}/${m.sender_id}`,
      postId: m.post_id,
      senderId: m.sender_id,
    }))
    setNotifications(list)
    setNotifCount(list.length)
    setUnreadCount(list.length)
  }

  async function handleNotifClick(n) {
    await supabase.from('messages').update({ is_read: true })
      .eq('post_id', n.postId).eq('sender_id', n.senderId).eq('receiver_id', profile.id)
    const updated = notifications.filter(x => x.id !== n.id)
    setNotifications(updated)
    setNotifCount(updated.length)
    setUnreadCount(updated.length)
    setShowNotif(false)
    navigate(n.link)
  }

  const isActive  = to => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  const avatarUrl = profile?.avatar_url
  const initials  = profile?.full_name?.charAt(0).toUpperCase() || '?'

  const NotifDropdown = () => !showNotif ? null : (
    <div style={{
      position: 'absolute', top: isMobile ? 48 : 52, right: 0,
      width: Math.min(320, window.innerWidth - 28),
      background: '#fff', borderRadius: 14,
      boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      border: '1.5px solid #E5E9F0',
      overflow: 'hidden', zIndex: 600,
      animation: 'notifIn 0.18s ease',
    }}>
      <div style={{ padding: '13px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>Notifications</span>
        {notifCount > 0 && (
          <span style={{ background: '#FDF2F2', color: DR, fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99 }}>
            {notifCount} unread
          </span>
        )}
      </div>
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {notifications.length === 0
          ? <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>No new notifications
            </div>
          : notifications.map(n => (
            <div key={n.id} onClick={() => handleNotifClick(n)}
              style={{ padding: '12px 16px', borderBottom: '1px solid #F8FAFC', cursor: 'pointer', background: '#FFF8F8', transition: 'background 0.12s', display: 'flex', alignItems: 'flex-start', gap: 10 }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF0F0'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFF8F8'}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: DR, flexShrink: 0, marginTop: 6 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{n.text}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{n.sub}</div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>
                  {new Date(n.time).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {new Date(n.time).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )

  /* ── MOBILE ── */
  if (isMobile) return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56,
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', zIndex: 300,
        boxShadow: '0 1px 0 #F1F5F9, 0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: DR, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 7, fontWeight: 800, lineHeight: 1.2, textAlign: 'center' }}>HC<br />DC</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>
            <span style={{ color: DR }}>FindIt </span>
            <span style={{ color: '#0F172A' }}>@ HCDC</span>
          </span>
        </div>

        <div ref={notifRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowNotif(v => !v)} style={{
            width: 38, height: 38, borderRadius: '50%', background: 'transparent', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notifCount > 0 && (
              <span style={{ position: 'absolute', top: 3, right: 3, background: DR, color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 99, minWidth: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid #fff' }}>
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>
          <NotifDropdown />
        </div>
      </header>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 64,
        background: DR,
        display: 'flex', alignItems: 'stretch',
        zIndex: 300,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -2px 16px rgba(139,0,0,0.22)',
      }}>
        {BN.map(link => {
          const active = isActive(link.to)
          const col    = active ? W : W50
          return (
            <Link key={link.to} to={link.to} style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, textDecoration: 'none', color: col,
              position: 'relative',
              transition: 'color 0.15s',
              WebkitTapHighlightColor: 'transparent',
            }}>
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 36, height: 3,
                  background: W,
                  borderRadius: '0 0 4px 4px',
                }} />
              )}
              <span style={{ position: 'relative' }}>
                {link.icon(col)}
                {link.badge && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -3, right: -6,
                    background: '#2563EB', color: '#fff',
                    fontSize: 8, fontWeight: 700, borderRadius: 99,
                    minWidth: 14, height: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 3px', border: `1.5px solid ${DR}`,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400, letterSpacing: '0.01em' }}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <style>{`
        @keyframes notifIn { from{opacity:0;transform:translateY(-6px) scale(.97)} to{opacity:1;transform:none} }
      `}</style>
    </>
  )

  /* ── DESKTOP / TABLET ── */
  const Label = ({ children }) => (
    <span style={{
      overflow: 'hidden', whiteSpace: 'nowrap', display: 'inline-block',
      maxWidth: collapsed ? 0 : 180,
      opacity: collapsed ? 0 : 1,
      transition: `max-width ${TR}, opacity ${collapsed ? '0.1s' : '0.2s'} ease ${collapsed ? '0s' : '0.07s'}`,
    }}>
      {children}
    </span>
  )

  const ls = active => ({
    display: 'flex', alignItems: 'center',
    gap: collapsed ? 0 : 12,
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: collapsed ? '11px' : '10px 14px',
    borderRadius: 10, textDecoration: 'none',
    color: active ? DR : W70,
    background: active ? W : 'transparent',
    fontWeight: active ? 600 : 400, fontSize: 14,
    transition: `all ${TR}`,
    boxShadow: active ? '0 2px 10px rgba(0,0,0,0.12)' : 'none',
    whiteSpace: 'nowrap', overflow: 'hidden',
    cursor: 'pointer', border: 'none',
    fontFamily: 'inherit', width: '100%',
  })

  const AvatarCircle = ({ size = 32, fs = 12 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: W25, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      {avatarUrl
        ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ color: W, fontWeight: 700, fontSize: fs }}>{initials}</span>}
    </div>
  )

  return (
    <>
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh',
        width: collapsed ? NARROW : WIDE,
        background: DR,
        display: 'flex', flexDirection: 'column',
        zIndex: 100,
        transition: `width ${TR}`,
        overflow: 'hidden',
        boxShadow: '4px 0 28px rgba(0,0,0,0.18)',
        willChange: 'width',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', height: 68, padding: '0 17px', borderBottom: `1px solid ${WB}`, flexShrink: 0, gap: 10, overflow: 'hidden' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: W15, border: `1px solid ${W25}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: W, fontWeight: 800, fontSize: 9, lineHeight: 1.3, textAlign: 'center' }}>HC<br />DC</span>
          </div>
          <div style={{ overflow: 'hidden', maxWidth: collapsed ? 0 : 160, opacity: collapsed ? 0 : 1, transition: `max-width ${TR}, opacity ${collapsed ? '0.1s' : '0.2s'} ease ${collapsed ? '0s' : '0.08s'}`, flexShrink: 0 }}>
            <div style={{ color: W, fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>FindIt</div>
            <div style={{ color: W50, fontSize: 11, whiteSpace: 'nowrap' }}>@ HCDC</div>
          </div>
        </div>

        {/* Toggle button */}
        <button onClick={() => setCollapsed(c => !c)} style={{
          display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          margin: '10px 10px 4px', padding: collapsed ? '9px' : '9px 14px',
          borderRadius: 10, border: `1px solid ${WB}`,
          background: W15, color: W70, cursor: 'pointer',
          fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          transition: `all ${TR}`, flexShrink: 0, overflow: 'hidden',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = W25; e.currentTarget.style.color = W }}
          onMouseLeave={e => { e.currentTarget.style.background = W15; e.currentTarget.style.color = W70 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ width: 18, height: 18, flexShrink: 0, transition: `transform ${TR}`, transform: collapsed ? 'rotate(90deg)' : 'none' }}>
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <Label>Hide Navigation</Label>
        </button>

        {/* Menu label */}
        <div style={{ padding: '10px 20px 4px', color: 'rgba(255,255,255,0.32)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', flexShrink: 0, overflow: 'hidden', maxHeight: collapsed ? 0 : 40, opacity: collapsed ? 0 : 1, transition: `max-height ${TR}, opacity ${collapsed ? '0.1s' : '0.2s'} ease` }}>
          Menu
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SB.map(link => {
            const active = isActive(link.to)
            return (
              <Link key={link.to} to={link.to} title={collapsed ? link.label : ''} style={ls(active)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.10)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ position: 'relative', flexShrink: 0 }}>
                  {link.icon}
                  {link.badge && unreadCount > 0 && collapsed && (
                    <span style={{ position: 'absolute', top: -4, right: -4, background: '#2563EB', color: W, fontSize: 9, fontWeight: 700, borderRadius: 99, minWidth: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <Label>{link.label}</Label>
                {!collapsed && link.badge && unreadCount > 0 && (
                  <span style={{ background: active ? '#2563EB' : W25, color: W, fontSize: 10, fontWeight: 700, borderRadius: 99, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0, marginLeft: 'auto' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div style={{ height: 1, background: WB, margin: '0 12px', flexShrink: 0 }} />

        {/* User card + logout */}
        <div style={{ flexShrink: 0, padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {!collapsed && profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: W15, marginBottom: 2, overflow: 'hidden' }}>
              <AvatarCircle size={32} fs={12} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ color: W, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.full_name}</div>
                <div style={{ color: W50, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile.student_id || profile.email}</div>
              </div>
            </div>
          )}
          {collapsed && profile && (
            <div title={profile.full_name} style={{ width: 38, height: 38, borderRadius: '50%', background: W25, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', overflow: 'hidden', flexShrink: 0 }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: W, fontWeight: 700, fontSize: 14 }}>{initials}</span>}
            </div>
          )}
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/login') }} title={collapsed ? 'Log out' : ''} style={ls(false)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = W }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = W70 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20, flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <Label>Log Out</Label>
          </button>
        </div>
      </aside>

      {/* Floating notification bell (desktop/tablet) */}
      <div ref={notifRef} style={{ position: 'fixed', top: 16, right: 20, zIndex: 200 }}>
        <button onClick={() => setShowNotif(v => !v)} style={{
          width: 42, height: 42, borderRadius: '50%',
          background: '#fff', border: '1.5px solid #E5E9F0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'box-shadow 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke={DR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifCount > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: DR, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 99, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #fff' }}>
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>
        <NotifDropdown />
      </div>

      <style>{`
        @keyframes notifIn { from{opacity:0;transform:translateY(-6px) scale(.97)} to{opacity:1;transform:none} }
      `}</style>
    </>
  )
}