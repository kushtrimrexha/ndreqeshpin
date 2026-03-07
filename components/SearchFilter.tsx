'use client'

interface FilterOption { value: string; label: string }

interface SearchFilterProps {
  search:        string
  onSearch:      (v: string) => void
  filters?:      { key: string; label: string; options: FilterOption[]; value: string; onChange: (v:string) => void }[]
  placeholder?:  string
  actions?:      React.ReactNode
}

export default function SearchFilter({ search, onSearch, filters = [], placeholder = 'Kërko...', actions }: SearchFilterProps) {
  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:20 }}>
      {/* Search input */}
      <div style={{ position:'relative', flex:'1 1 220px', minWidth:180 }}>
        <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, opacity:0.4, pointerEvents:'none' }}>🔍</span>
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder={placeholder}
          style={{ width:'100%', padding:'10px 14px 10px 38px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color:'#e8eaf0', fontSize:13, fontFamily:"'DM Sans',sans-serif", outline:'none', transition:'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'rgba(232,98,26,0.4)'}
          onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
        {search && (
          <button onClick={() => onSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(232,234,240,0.4)', cursor:'pointer', fontSize:16, lineHeight:1 }}>×</button>
        )}
      </div>

      {/* Filters */}
      {filters.map(f => (
        <select key={f.key} value={f.value} onChange={e => f.onChange(e.target.value)}
          style={{ padding:'10px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, color: f.value ? '#e8eaf0' : 'rgba(232,234,240,0.45)', fontSize:13, fontFamily:"'DM Sans',sans-serif", cursor:'pointer', outline:'none', minWidth:140 }}>
          <option value="">{f.label}</option>
          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ))}

      {actions}
    </div>
  )
}