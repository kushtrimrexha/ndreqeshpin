import type { Metadata } from 'next'
import { ToastProvider } from '@/components/Toast'

export const metadata: Metadata = {
  title:       'NdreqeShpin — Platforma #1 për renovime shtëpiake',
  description: 'Gjej profesionistë të verifikuar për çdo punë shtëpiake. Kompani dhe punëtorë dërgojnë oferta brenda orëve.',
  keywords:    'renovime, ndërtim, punëtorë, Kosovë, hidroizolim, elektrik, suvatim',
  openGraph: {
    title:       'NdreqeShpin',
    description: 'Platforma #1 për renovime shtëpiake në Kosovë',
    type:        'website',
    locale:      'sq_AL',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin:0, padding:0, background:'#080b12' }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}