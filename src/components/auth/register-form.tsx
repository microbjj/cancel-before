'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { registerSchema, type RegisterInput } from '@/lib/schemas'

const inputClass =
    'w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-light placeholder:text-grays focus:border-primary focus:outline-none'
const labelClass = 'mb-1 block text-sm font-medium text-grays'

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
                <label htmlFor="name" className={labelClass}>
                    Имя
                </label>
                <input
                    id="name"
                    type="text"
                    className={inputClass}
                    placeholder="Иван"
                    {...register('name')}
                />
                {errors.name ? (
                    <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
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

            <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                    Повторите пароль
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                />
                {errors.confirmPassword ? (
                    <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
                ) : null}
            </div>

            {error ? <p className="text-xs text-red-400">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
            </Button>

            <p className="text-grays text-center text-xs">
                Уже есть аккаунт?{' '}
                <Link
                    href="/login"
                    className="text-light hover:text-primary transition-colors duration-100"
                >
                    Войти
                </Link>
            </p>
        </form>
    )
}
