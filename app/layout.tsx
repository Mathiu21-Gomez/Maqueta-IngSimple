import type { Metadata, Viewport } from 'next'
import { Fraunces, Geist_Mono, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope'
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: '--font-fraunces'
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'EvalPro | Sistema de Evaluación de Proveedores',
  description: 'Plataforma integral de automatización para evaluación de proveedores institucionales',
  generator: 'v0.app',
  icons: {
    icon: '/logo%20real.svg',
    shortcut: '/logo%20real.svg',
    apple: '/logo%20real.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#f6efe5',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${manrope.variable} ${fraunces.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
