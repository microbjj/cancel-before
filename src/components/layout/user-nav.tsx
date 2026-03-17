"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export function UserNav() {
  const { status } = useSession()

  if (status === "loading") {
    return null
  }

  if (status === "unauthenticated") {
    return (
      <Link
        href="/login"
        className="hover:text-foreground transition-colors"
      >
        Войти
      </Link>
    )
  }

  return (
    <div className="flex items-center">
      <Link
        href="/profile"
        className="hover:text-foreground transition-colors"
      >
        Профиль
      </Link>
    </div>
  )
}

