import Link from 'next/link'
import { Container } from '@/components/shared/container'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/ui/logo'

const navItems = [
    { href: '/', label: 'Главная' },
    { href: '/dashboard', label: 'Панель' },
]

export function Header() {
    return (
        <header className="bg-background/90 border-b backdrop-blur">
            <Container className="flex h-16 items-center justify-between">
                <Logo size="m" />
                <nav className="text-muted-foreground flex items-center gap-2 text-sm">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <ThemeToggle />
                </nav>
            </Container>
        </header>
    )
}
