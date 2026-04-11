import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
    title: 'CancelBefore',
    description: 'Отменяйте подписки до списания и не пропускайте дедлайны',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased`}>
                <AuthProvider>
                    <ThemeProvider attribute="class" forcedTheme="dark" disableTransitionOnChange>
                        {children}
                        <Toaster position="top-right" richColors />
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
