'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export function UserNav() {
    const { status } = useSession()

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
        <Link
            href="/profile"
            className="text-grays hover:text-primary text-sm transition-colors duration-100"
        >
            Профиль
        </Link>
    )
}
