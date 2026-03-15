import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/auth/login-form'
import { Container } from '@/components/shared/container'
import { getAuthSession } from '@/lib/auth'

export default async function LoginPage() {
    const session = await getAuthSession()

    if (session?.user?.id) {
        redirect('/dashboard')
    }

    return (
        <Container className="py-12">
            <section className="mx-auto max-w-md space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Вход в аккаунт</h1>
                <p className="text-muted-foreground text-sm">
                    Для MVP используется простой вход по email. Если пользователя еще нет, он будет
                    создан автоматически.
                </p>
                <LoginForm />
            </section>
        </Container>
    )
}
