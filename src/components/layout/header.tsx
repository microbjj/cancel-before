import Link from 'next/link'
import { Container } from '@/components/shared/container'
import { UserNav } from '@/components/layout/user-nav'

const navItems = [{ href: '/dashboard', label: 'Панель' }]

export function Header() {
    return (
        <header className="border-border bg-dark border-b">
            <Container className="flex h-12 items-center justify-between">
                <Link
                    href="/"
                    className="text-light hover:text-primary text-sm font-semibold transition-colors duration-100"
                >
                    CancelBefore
                </Link>
                <nav className="flex items-center gap-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-grays hover:text-primary text-sm transition-colors duration-100"
                        >
                            {item.label}
                        </Link>
                    ))}
                    <UserNav />
                </nav>
            </Container>
        </header>
    )
}
