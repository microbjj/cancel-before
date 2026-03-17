'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { registerSchema, type RegisterInput } from '@/lib/schemas'

export function RegisterForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema as never),
        defaultValues: {
            email: '',
            name: '',
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = handleSubmit(async (values) => {
        setError(null)

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })

        if (!res.ok) {
            const text = await res.text()
            let message = 'Ошибка при регистрации.'
            if (text) {
                try {
                    const data = JSON.parse(text) as { error?: string }
                    if (typeof data.error === 'string') message = data.error
                } catch {
                    // non-JSON error body, use default message
                }
            }
            setError(message)
            return
        }

        const result = await signIn('credentials', {
            email: values.email,
            password: values.password,
            callbackUrl: '/dashboard',
            redirect: false,
        })

        if (!result || result.error) {
            setError('Регистрация прошла успешно, но войти не удалось. Попробуйте войти вручную.')
            return
        }

        router.push(result.url ?? '/dashboard')
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
                    Имя
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

            <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                    Пароль
                </label>
                <input
                    id="password"
                    type="password"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="••••••••"
                    {...register('password')}
                />
                {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
            </div>

            <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Повторите пароль
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                />
                {errors.confirmPassword ? (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                ) : null}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{' '}
                <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
                    Войти
                </Link>
            </p>
        </form>
    )
}
