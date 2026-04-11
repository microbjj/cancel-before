import { type ReactNode } from 'react'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

type AppLayoutProps = {
    children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="bg-dark flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
