'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function UserNav() {
    const { data: session, status } = useSession()

    if (status === 'loading') {
        return null
    }

    if (status === 'unauthenticated') {
        return (
            <Link
                href="/login"
                className="text-grays hover:text-primary text-sm transition-colors duration-100"
            >
                Войти
            </Link>
        )
    }

    return (
        <>
            {session?.user?.role === 'ADMIN' && (
                <Link
                    href="/admin"
                    className="text-grays hover:text-primary text-sm transition-colors duration-100"
                >
                    Admin
                </Link>
            )}
            <Link
                href="/profile"
                className="text-grays hover:text-primary text-sm transition-colors duration-100"
            >
                Профиль
            </Link>
        </>
    )
}
