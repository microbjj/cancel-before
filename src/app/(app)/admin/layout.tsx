import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getAuthSession } from '@/lib/auth'
import { Container } from '@/components/shared/container'

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getAuthSession()

    if (!session?.user?.id) {
        redirect('/login')
    }

    if (session.user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div className="bg-dark flex min-h-screen flex-col">
            <header className="border-border border-b">
                <Container className="flex h-12 items-center">
                    <span className="text-grays text-sm font-medium">Admin</span>
                </Container>
            </header>
            <main className="flex-1">
                <Container className="py-6 sm:py-8">{children}</Container>
            </main>
        </div>
    )
}
