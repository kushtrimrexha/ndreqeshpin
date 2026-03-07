'use client'

import Sidebar      from '@/components/Sidebar'
import GlobalSearch from '@/components/GlobalSearch'

type Role = 'client' | 'company' | 'worker' | 'admin'

interface PageShellProps {
  role:        Role
  userName:    string
  userId?:     string
  pageTitle?:  string
  pageIcon?:   string
  package?:    string
  avatar?:     string
  breadcrumb?: { label: string; href?: string }[]
  actions?:    React.ReactNode
  children:    React.ReactNode
}

export default function PageShell({
  role, userName, userId = '', pageTitle = '', pageIcon = '',
  package: pkg = 'free', avatar,
  breadcrumb, actions, children,
}: PageShellProps) {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0908', color:'#f0ece4', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", display:'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,300;1,9..144,400&display=swap');
        @keyframes fadeUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideDown{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes toastIn  { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(20px) scale(0.95)} }
        @keyframes drift    { 0%,100%{transform:translate(0,0)} 33%{transform:translate(4px,-6px)} 66%{transform:translate(-3px,3px)} }
        @keyframes searchIn { from{opacity:0;transform:scale(0.96) translateY(-8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes overlayIn{ from{opacity:0} to{opacity:1} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(240,236,228,0.08);border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:rgba(240,236,228,0.14)}
        .skeleton{background:linear-gradient(90deg,rgba(240,236,228,0.04) 25%,rgba(240,236,228,0.08) 50%,rgba(240,236,228,0.04) 75%);background-size:200% auto;animation:shimmer 1.6s linear infinite;border-radius:8px}
        .page-content{animation:fadeUp 0.4s ease}
        @media(max-width:767px){
          .page-topbar{padding:0 16px !important}
          .page-content-wrap{padding:20px 16px 48px !important}
          .search-trigger{display:none !important}
        }
      `}</style>

      <Sidebar role={role} userName={userName} userId={userId} avatar={avatar} package={pkg} />

      <div style={{ flex:1, overflowY:'auto', minWidth:0, display:'flex', flexDirection:'column' }}>

        {/* ── TOPBAR ─────────────────────────────────────── */}
        <div className="page-topbar" style={{
          position:'sticky', top:0, zIndex:50,
          background:'rgba(10,9,8,0.92)',
          backdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(240,236,228,0.06)',
          padding:'0 32px', height:60,
          display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            {breadcrumb && breadcrumb.length > 0 ? (
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, minWidth:0 }}>
                {breadcrumb.map((crumb, i) => (
                  <span key={i} style={{ display:'flex', alignItems:'center', gap:6, minWidth:0 }}>
                    {i > 0 && <span style={{ color:'rgba(240,236,228,0.2)', fontSize:11 }}>›</span>}
                    {crumb.href ? (
                      <a href={crumb.href} style={{ color:'rgba(240,236,228,0.4)', textDecoration:'none', fontWeight:500, whiteSpace:'nowrap', transition:'color 0.15s' }}
                        onMouseEnter={e=>(e.currentTarget.style.color='rgba(240,236,228,0.8)')}
                        onMouseLeave={e=>(e.currentTarget.style.color='rgba(240,236,228,0.4)')}>
                        {crumb.label}
                      </a>
                    ) : (
                      <span style={{ color:'#f0ece4', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>{pageIcon}</span>
                <span style={{ fontSize:15, fontWeight:700, color:'#f0ece4', letterSpacing:'-0.01em' }}>{pageTitle}</span>
              </div>
            )}
          </div>

          {/* Right: Search + Actions */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div className="search-trigger">
              <GlobalSearch role={role} userId={userId} />
            </div>
            {actions && <div style={{ display:'flex', alignItems:'center', gap:8 }}>{actions}</div>}
          </div>
        </div>

        {/* ── CONTENT ────────────────────────────────────── */}
        <div className="page-content-wrap page-content" style={{ padding:'32px 32px 80px', flex:1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}