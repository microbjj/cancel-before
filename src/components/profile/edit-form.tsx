'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const labelClass = 'mb-1 block text-xs text-grays'

type ProfileEditFormProps = {
    initialName: string | null
}

export function ProfileEditForm({ initialName }: ProfileEditFormProps) {
    const [name, setName] = useState(initialName ?? '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        const payload: Record<string, string> = { name }
        if (newPassword) {
            payload.currentPassword = currentPassword
            payload.newPassword = newPassword
        }

        setIsSubmitting(true)
        const res = await fetch('/api/profile', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
        })
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        setIsSubmitting(false)

        if (!res.ok) {
            setError(body?.error ?? 'Не удалось сохранить.')
            return
        }

        toast.success('Сохранено')
        setCurrentPassword('')
        setNewPassword('')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className={labelClass}>Имя</label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    maxLength={100}
                />
            </div>

            <div>
                <label className={labelClass}>Текущий пароль</label>
                <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
            </div>

            <div>
                <label className={labelClass}>Новый пароль</label>
                <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Минимум 8 символов"
                    autoComplete="new-password"
                />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? '…' : 'Сохранить'}
            </Button>
        </form>
    )
}
