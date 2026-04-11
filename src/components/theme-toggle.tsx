'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'

function useIsClient() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    )
}

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const mounted = useIsClient()

    if (!mounted) {
        return (
            <Button aria-label="Переключить тему" variant="ghost" size="icon" disabled>
                <Sun />
            </Button>
        )
    }

    const isDark = resolvedTheme === 'dark'

    return (
        <Button
            aria-label="Переключить тему"
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            {isDark ? <Sun /> : <Moon />}
        </Button>
    )
}
