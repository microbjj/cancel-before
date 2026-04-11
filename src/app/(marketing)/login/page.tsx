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
            <section className="mx-auto max-w-sm space-y-4">
                <p className="text-light text-base font-semibold">Вход в аккаунт</p>
                <LoginForm />
            </section>
        </Container>
    )
}
