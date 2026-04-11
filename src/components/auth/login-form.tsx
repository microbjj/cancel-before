'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { type Resolver, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
    loginCredentialsSchema,
    type LoginCredentials,
    type LoginCredentialsInput,
} from '@/lib/schemas'

const inputClass =
    'w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-light placeholder:text-grays focus:border-primary focus:outline-none'
const labelClass = 'mb-1 block text-sm font-medium text-grays'

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
            password: '',
        },
    })

    const onSubmit = handleSubmit(async (values) => {
        setError(null)

        const result = await signIn('credentials', {
            email: values.email,
            password: values.password,
            callbackUrl,
            redirect: false,
        })

        if (!result || result.error) {
            setError('Неверный email или пароль.')
            return
        }

        router.push(result.url ?? callbackUrl)
        router.refresh()
    })

    return (
        <form onSubmit={onSubmit} className="border-border space-y-4 border p-6">
            <div>
                <label htmlFor="email" className={labelClass}>
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    className={inputClass}
                    placeholder="name@example.com"
                    {...register('email')}
                />
                {errors.email ? (
                    <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                ) : null}
            </div>

            <div>
                <label htmlFor="password" className={labelClass}>
                    Пароль
                </label>
                <input
                    id="password"
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    {...register('password')}
                />
                {errors.password ? (
                    <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                ) : null}
            </div>

            {error ? <p className="text-xs text-red-400">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Входим...' : 'Войти'}
            </Button>

            <p className="text-grays text-center text-xs">
                Нет аккаунта?{' '}
                <Link
                    href="/register"
                    className="text-light hover:text-primary transition-colors duration-100"
                >
                    Зарегистрироваться
                </Link>
            </p>
        </form>
    )
}
