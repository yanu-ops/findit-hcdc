import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import Navbar from './Navbar'

const WIDE   = 260
const NARROW = 72
const EASE   = 'cubic-bezier(0.4, 0, 0.2, 1)'
const TRANS  = `0.28s ${EASE}`

function useIsMobile() {
  const [v, setV] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 640)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return v
}

export default function Layout() {
  const isMobile = useIsMobile()
  const location = useLocation()

  const [sidebarState, setSidebarState] = useState(() => {
    try { return localStorage.getItem('sb-collapsed') === 'true' ? 'collapsed' : 'expanded' }
    catch { return 'expanded' }
  })

  useEffect(() => {
    const handler = e => {
      if (e.detail === 'mobile') setSidebarState('mobile')
      else setSidebarState(e.detail ? 'collapsed' : 'expanded')
    }
    window.addEventListener('sb-toggle', handler)
    return () => window.removeEventListener('sb-toggle', handler)
  }, [])

  useEffect(() => {
    if (isMobile) setSidebarState('mobile')
    else {
      try { setSidebarState(localStorage.getItem('sb-collapsed') === 'true' ? 'collapsed' : 'expanded') }
      catch { setSidebarState('expanded') }
    }
  }, [isMobile])

  const marginLeft = sidebarState === 'mobile'    ? 0
    : sidebarState === 'collapsed' ? NARROW
    : WIDE

  const isBrowse = location.pathname === '/'

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FB' }}>
      <Navbar />

      <div style={{
        marginLeft,
        minHeight: '100vh',
        transition: sidebarState === 'mobile' ? 'none' : `margin-left ${TRANS}`,
        willChange: 'margin-left',
        background: '#F8F9FB',
      }}>
        {isMobile ? (
          /*
           * Mobile wrapper — Browse page manages its own full-bleed sections
           * (tabs, search, category chips) so we don't add horizontal padding there.
           * All other pages get 16px side padding so text never hits the screen edge.
           */
          isBrowse
            ? <div style={{ paddingTop: 56, paddingBottom: 80 }}>
                <Outlet />
              </div>
            : <div style={{ padding: '72px 16px 88px' }}>
                <Outlet />
              </div>
        ) : (
          /* Desktop / tablet */
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px 60px' }}>
            <Outlet />
          </div>
        )}
      </div>

      {/* Mobile FAB — floating "+" button above the bottom nav bar */}
      {isMobile && location.pathname !== '/create' && (
        <Link to="/create" style={{
          position: 'fixed',
          bottom: 76,
          right: 18,
          width: 52, height: 52,
          borderRadius: '50%',
          background: '#fff',
          border: '1.5px solid #E5E9F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
          zIndex: 150,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#0F172A"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ width: 22, height: 22 }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      )}
    </div>
  )
}