// ─── Date utilities — locale-independent, no hydration issues ─────────────────

const MONTHS_SHORT = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj']
const MONTHS_LONG  = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']
const DAYS_LONG    = ['E diel','E hënë','E martë','E mërkurë','E enjte','E premte','E shtunë']

/** "15.03.2025" */
export function fmtDate(d: string | Date): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  return `${String(dt.getDate()).padStart(2,'0')}.${String(dt.getMonth()+1).padStart(2,'0')}.${dt.getFullYear()}`
}

/** "15 Mars" */
export function fmtDateShort(d: string | Date): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]}`
}

/** "Mars 2025" */
export function fmtMonthYear(d: string | Date): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  return `${MONTHS_LONG[dt.getMonth()]} ${dt.getFullYear()}`
}

/** "15 Mars 2025" */
export function fmtDateLong(d: string | Date): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  return `${dt.getDate()} ${MONTHS_LONG[dt.getMonth()]} ${dt.getFullYear()}`
}

/** "E hënë, 15 Mars" */
export function fmtDateWithDay(d: string | Date): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  return `${DAYS_LONG[dt.getDay()]}, ${dt.getDate()} ${MONTHS_LONG[dt.getMonth()]}`
}

/** "Mar '25" — for chart keys, ALWAYS consistent */
export function fmtChartKey(d: string | Date): string {
  const dt = typeof d === 'string' ? new Date(d) : d
  return `${MONTHS_SHORT[dt.getMonth()]} '${String(dt.getFullYear()).slice(2)}`
}

/** "2 minuta më parë" etc */
export function timeAgo(d: string | Date): string {
  const diff  = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'Tani'
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days  < 7)  return `${days}d`
  return fmtDateShort(d)
}