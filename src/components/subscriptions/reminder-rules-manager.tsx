'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { type Resolver, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { reminderRuleCreateSchema, type ReminderRuleInput } from '@/lib/schemas/reminder-rule'

type ReminderRule = {
    id: string
    daysBefore: number
    isActive: boolean
}

type ReminderRulesManagerProps = {
    subscriptionId: string
    initialRules: ReminderRule[]
}

export function ReminderRulesManager({ subscriptionId, initialRules }: ReminderRulesManagerProps) {
    const [rules, setRules] = useState(initialRules)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ReminderRuleInput, undefined, ReminderRuleInput>({
        resolver: zodResolver(reminderRuleCreateSchema as never) as Resolver<
            ReminderRuleInput,
            undefined,
            ReminderRuleInput
        >,
        defaultValues: {
            daysBefore: 2,
            isActive: true,
        },
    })

    const addRule = handleSubmit(async (values) => {
        setError(null)
        setSuccessMessage(null)
        const response = await fetch(`/api/subscriptions/${subscriptionId}/reminder-rules`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                daysBefore: values.daysBefore,
                isActive: true,
            }),
        })

        const body = (await response.json().catch(() => null)) as {
            error?: string
            data?: ReminderRule
        } | null

        if (!response.ok || !body?.data) {
            setError(body?.error ?? 'Не удалось добавить правило.')
            return
        }

        setRules((prev) => [...prev, body.data!].sort((a, b) => b.daysBefore - a.daysBefore))
        reset({ daysBefore: 2, isActive: true })
        setSuccessMessage('Правило добавлено.')
    })

    async function removeRule(ruleId: string) {
        setError(null)
        setSuccessMessage(null)

        const response = await fetch(`/api/reminder-rules/${ruleId}`, { method: 'DELETE' })
        const body = (await response.json().catch(() => null)) as { error?: string } | null

        if (!response.ok) {
            setError(body?.error ?? 'Не удалось удалить правило.')
            return
        }

        setRules((prev) => prev.filter((rule) => rule.id !== ruleId))
        setSuccessMessage('Правило удалено.')
    }

    async function toggleRule(rule: ReminderRule) {
        setError(null)
        setSuccessMessage(null)

        const response = await fetch(`/api/reminder-rules/${rule.id}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                isActive: !rule.isActive,
            }),
        })

        const body = (await response.json().catch(() => null)) as {
            error?: string
            data?: ReminderRule
        } | null

        if (!response.ok || !body?.data) {
            setError(body?.error ?? 'Не удалось обновить правило.')
            return
        }

        setRules((prev) =>
            prev.map((item) =>
                item.id === body.data!.id ? { ...item, isActive: body.data!.isActive } : item,
            ),
        )
        setSuccessMessage('Правило обновлено.')
    }

    return (
        <section className="space-y-4 rounded-lg border p-6">
            <h2 className="text-xl font-semibold">Правила напоминаний</h2>

            <form onSubmit={addRule} className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                    <label htmlFor="daysBefore" className="text-sm font-medium">
                        За сколько дней напомнить
                    </label>
                    <input
                        id="daysBefore"
                        type="number"
                        min={0}
                        max={90}
                        className="bg-background w-40 rounded-md border px-3 py-2 text-sm"
                        {...register('daysBefore', { valueAsNumber: true })}
                    />
                    {errors.daysBefore ? (
                        <p className="text-destructive text-sm">{errors.daysBefore.message}</p>
                    ) : null}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Добавляем...' : 'Добавить правило'}
                </Button>
            </form>

            {rules.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    Пока нет правил. Добавьте первое напоминание.
                </p>
            ) : (
                <ul className="space-y-2">
                    {rules.map((rule) => (
                        <li
                            key={rule.id}
                            className="flex items-center justify-between gap-4 rounded-md border p-3"
                        >
                            <div className="text-sm">
                                <p className="font-medium">{rule.daysBefore} дн. до дедлайна</p>
                                <p className="text-muted-foreground">
                                    Статус: {rule.isActive ? 'Активно' : 'Выключено'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => toggleRule(rule)}
                                >
                                    {rule.isActive ? 'Выключить' : 'Включить'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => removeRule(rule.id)}
                                >
                                    Удалить
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {error ? <p className="text-destructive text-sm">{error}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
        </section>
    )
}
