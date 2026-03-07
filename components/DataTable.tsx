'use client'

import { useState } from 'react'

export interface Column<T> {
  key:       string
  label:     string
  width?:    string
  render?:   (row: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T extends { id: string }> {
  columns:    Column<T>[]
  data:       T[]
  loading?:   boolean
  emptyIcon?: string
  emptyTitle?: string
  emptyMsg?:  string
  onRowClick?: (row: T) => void
}

export default function DataTable<T extends { id: string }>({
  columns, data, loading = false,
  emptyIcon = '📋', emptyTitle = 'Asnjë të dhënë', emptyMsg = 'Nuk ka të dhëna për t\'u shfaqur.',
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...data].sort((a,b) => {
    if (!sortKey) return 0
    const av = (a as any)[sortKey]
    const bv = (b as any)[sortKey]
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, overflow:'hidden' }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .dt-row{transition:background 0.15s}
        .dt-row:hover{background:rgba(255,255,255,0.03) !important}
        .dt-row-click{cursor:pointer !important}
        .dt-sort:hover{color:#e8eaf0 !important}
      `}</style>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:"'DM Sans',sans-serif" }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              {columns.map(col => (
                <th key={col.key} style={{ padding:'13px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:'rgba(232,234,240,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap', width:col.width, cursor: col.sortable ? 'pointer' : 'default', userSelect:'none' }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? 'dt-sort' : ''}>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                    {col.label}
                    {col.sortable && sortKey === col.key && <span style={{ fontSize:10, color:'#e8621a' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_,i) => (
                <tr key={i} className="dt-row">
                  {columns.map((_c,j) => (
                    <td key={j} style={{ padding:'16px 20px' }}>
                      <div style={{ height:14, borderRadius:6, background:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize:'200% auto', animation:'shimmer 1.6s linear infinite', width: j===0 ? '70%' : '50%' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding:'56px 32px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>{emptyIcon}</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:'1.1rem', fontWeight:800, color:'#e8eaf0', marginBottom:6 }}>{emptyTitle}</div>
                <div style={{ fontSize:13, color:'rgba(232,234,240,0.4)' }}>{emptyMsg}</div>
              </td></tr>
            ) : (
              sorted.map(row => (
                <tr key={row.id} className={`dt-row ${onRowClick ? 'dt-row-click' : ''}`}
                  onClick={() => onRowClick?.(row)}
                  style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding:'14px 20px', fontSize:13, color:'rgba(232,234,240,0.75)', verticalAlign:'middle' }}>
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}