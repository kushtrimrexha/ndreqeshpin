import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight:'100vh', background:'#0a0908', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Helvetica Neue',sans-serif", padding:24, overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float    { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-16px) rotate(2deg)} }
        @keyframes drift    { 0%,100%{transform:translate(0,0)} 33%{transform:translate(8px,-10px)} 66%{transform:translate(-6px,5px)} }
        @keyframes glow     { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .btn-home:hover{transform:translateY(-2px)!important;box-shadow:0 12px 36px rgba(232,98,26,0.45)!important}
        .btn-back:hover{border-color:rgba(240,236,228,0.2)!important;color:rgba(240,236,228,0.8)!important}
      `}</style>

      {/* Background particles */}
      {[...Array(12)].map((_,i)=>(
        <div key={i} style={{ position:'fixed', left:`${8+i*8}%`, top:`${10+Math.sin(i)*40}%`, width:Math.random()*3+1, height:Math.random()*3+1, borderRadius:'50%', background:'rgba(232,98,26,0.3)', animation:`drift ${5+i*0.5}s ease-in-out ${i*0.3}s infinite`, pointerEvents:'none' }}/>
      ))}

      {/* Ambient glow */}
      <div style={{ position:'fixed', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:600, height:400, background:'radial-gradient(ellipse,rgba(232,98,26,0.06) 0%,transparent 70%)', pointerEvents:'none', animation:'glow 4s ease-in-out infinite' }}/>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(240,236,228,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(240,236,228,0.015) 1px,transparent 1px)', backgroundSize:'56px 56px', pointerEvents:'none' }}/>

      <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:520 }}>

        {/* Big 404 */}
        <div style={{ animation:'fadeUp 0.7s ease' }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(7rem,20vw,12rem)', fontWeight:900, letterSpacing:'-0.05em', lineHeight:0.9, color:'transparent', WebkitTextStroke:'2px rgba(232,98,26,0.3)', position:'relative', marginBottom:8, animation:'float 6s ease-in-out infinite' }}>
            404
            <div style={{ position:'absolute', inset:0, fontFamily:"'Fraunces',serif", fontSize:'inherit', fontWeight:900, letterSpacing:'inherit', lineHeight:'inherit', color:'rgba(232,98,26,0.08)', WebkitTextStroke:'none', filter:'blur(24px)' }}>404</div>
          </div>
        </div>

        {/* Logo + Content */}
        <div style={{ animation:'fadeUp 0.7s ease 0.15s both' }}>
          <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none', marginBottom:28 }}>
            <div style={{ width:36, height:36, background:'linear-gradient(135deg,#e8621a,#ff8c4a)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Fraunces',serif", fontWeight:900, color:'#fff', fontSize:18 }}>N</div>
            <span style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:18, letterSpacing:'-0.04em', color:'rgba(240,236,228,0.6)' }}>Ndreqe<span style={{ color:'#e8621a' }}>Shpin</span></span>
          </Link>

          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.5rem,4vw,2.2rem)', fontWeight:900, letterSpacing:'-0.03em', color:'#f0ece4', marginBottom:14, lineHeight:1.1 }}>
            Kjo faqe nuk<br/><em style={{ color:'#e8621a' }}>ekziston</em>
          </h1>
          <p style={{ fontSize:15, color:'rgba(240,236,228,0.45)', lineHeight:1.8, marginBottom:36, maxWidth:360, margin:'0 auto 36px' }}>
            Faqja që po kërkoni mund të jetë fshirë, lëvizur, ose linkun e keni shtypur gabim.
          </p>
        </div>

        {/* CTA Buttons */}
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', animation:'fadeUp 0.7s ease 0.3s both' }}>
          <Link href="/" className="btn-home"
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px', borderRadius:14, background:'linear-gradient(135deg,#e8621a,#ff7c35)', color:'#fff', textDecoration:'none', fontFamily:"'Fraunces',serif", fontWeight:700, fontSize:'0.95rem', boxShadow:'0 6px 24px rgba(232,98,26,0.35)', transition:'all 0.2s' }}>
            🏠 Kthehu në kryefaqe
          </Link>
          <Link href="/login" className="btn-back"
            style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px', borderRadius:14, border:'1px solid rgba(240,236,228,0.1)', background:'rgba(240,236,228,0.03)', color:'rgba(240,236,228,0.5)', textDecoration:'none', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:'0.95rem', transition:'all 0.2s' }}>
            Hyr në llogari →
          </Link>
        </div>

        {/* Error code */}
        <div style={{ marginTop:48, animation:'fadeUp 0.7s ease 0.45s both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'8px 18px', borderRadius:50, border:'1px solid rgba(240,236,228,0.07)', background:'rgba(240,236,228,0.02)' }}>
            <span style={{ fontSize:12, color:'rgba(240,236,228,0.25)', fontFamily:"'Fira Code',monospace" }}>ERR_404 · NOT_FOUND</span>
          </div>
        </div>

        {/* Scrolling quick links */}
        <div style={{ marginTop:40, overflow:'hidden', animation:'fadeUp 0.7s ease 0.55s both' }}>
          <div style={{ display:'flex', gap:24, animation:'marquee 18s linear infinite', width:'max-content', padding:'12px 0' }}>
            {[...Array(2)].fill(['🏠 Klienti','🏢 Kompania','🔧 Punëtori','💎 Premium','📋 Aplikimet','💬 Mesazhet','⭐ Vlerësimet']).flat().map((item,i)=>(
              <span key={i} style={{ fontSize:12, fontWeight:600, color:'rgba(240,236,228,0.2)', whiteSpace:'nowrap', letterSpacing:'0.04em' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}