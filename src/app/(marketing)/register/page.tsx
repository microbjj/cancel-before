import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/auth/register-form'
import { Container } from '@/components/shared/container'
import { getAuthSession } from '@/lib/auth'

export default async function RegisterPage() {
    const session = await getAuthSession()

    if (session?.user?.id) {
        redirect('/dashboard')
    }

    return (
        <Container className="py-12">
            <section className="mx-auto max-w-md space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Регистрация</h1>
                <p className="text-muted-foreground text-sm">
                    Создайте аккаунт, чтобы начать отслеживать подписки.
                </p>
                <RegisterForm />
            </section>
        </Container>
    )
}
