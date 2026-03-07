import type { Metadata, Viewport } from 'next'
import { ToastProvider } from '@/components/Toast'
import './globals.css'
<link rel="manifest" href="/site.webmanifest" />


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0908',
}

export const metadata: Metadata = {
  title: {
    default:  'NdreqeShpin — Platforma #1 për renovime shtëpiake',
    template: '%s | NdreqeShpin',
  },
  description: 'Gjej profesionistë të verifikuar për çdo punë shtëpiake. Kompani dhe punëtorë dërgojnë oferta brenda orëve.',
  keywords:    ['renovime', 'ndërtim', 'punëtorë', 'Kosovë', 'hidroizolim', 'elektrik', 'suvatim', 'ndreqeshpin'],
  authors:     [{ name: 'NdreqeShpin' }],
  robots:      { index: true, follow: true },
  openGraph: {
    title:       'NdreqeShpin — Platforma #1 për renovime',
    description: 'Gjej profesionistë të verifikuar për çdo punë shtëpiake në Kosovë.',
    type:        'website',
    locale:      'sq_AL',
    siteName:    'NdreqeShpin',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'NdreqeShpin',
    description: 'Platforma #1 për renovime shtëpiake',
  },
  icons: {
    icon:  '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0a0908', minHeight: '100vh', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' } as React.CSSProperties}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}