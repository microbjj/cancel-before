'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { type Resolver, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { loginCredentialsSchema, type LoginCredentials, type LoginCredentialsInput } from '@/lib/schemas'

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

    const [error, setError] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginCredentialsInput, undefined, LoginCredentials>({
        resolver: zodResolver(loginCredentialsSchema as never) as Resolver<
            LoginCredentialsInput,
            undefined,
            LoginCredentials
        >,
        defaultValues: {
            email: '',
            name: '',
        },
    })

    const onSubmit = handleSubmit(async (values) => {
        setError(null)

        const result = await signIn('credentials', {
            email: values.email,
            name: values.name ?? undefined,
            callbackUrl,
            redirect: false,
        })

        if (!result || result.error) {
            setError('Не удалось войти. Проверьте email и попробуйте снова.')
            return
        }

        router.push(result.url ?? callbackUrl)
        router.refresh()
    })

    return (
        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-6">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="name@example.com"
                    {...register('email')}
                />
                {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Имя (опционально)
                </label>
                <input
                    id="name"
                    type="text"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Иван"
                    {...register('name')}
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Входим...' : 'Войти'}
            </Button>
        </form>
    )
}
