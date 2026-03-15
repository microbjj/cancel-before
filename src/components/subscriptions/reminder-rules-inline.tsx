'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { validateReminderRuleInput } from '@/lib/reminder-rules'

export type ReminderRuleItem = {
    id: string
    daysBefore: number
    isActive: boolean
}

type ReminderRulesInlineProps = {
    subscriptionId: string
    initialRules: ReminderRuleItem[]
    /** Без своей карточки, в одну линию с формой */
    embedded?: boolean
}

const inputBase = 'rounded-md border border-input bg-background text-xs py-1 px-2 w-10 text-center focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/50'

export function ReminderRulesInline({ subscriptionId, initialRules, embedded }: ReminderRulesInlineProps) {
    const [rules, setRules] = useState(initialRules)
    const [error, setError] = useState<string | null>(null)
    const [daysInput, setDaysInput] = useState(2)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function addRule() {
        setError(null)
        const validation = validateReminderRuleInput({ daysBefore: daysInput, isActive: true })
        if (!validation.ok) {
            setError(validation.error)
            return
        }
        setIsSubmitting(true)
        const res = await fetch(`/api/subscriptions/${subscriptionId}/reminder-rules`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ daysBefore: validation.data.daysBefore, isActive: true }),
        })
        const body = (await res.json().catch(() => null)) as { error?: string; data?: ReminderRuleItem } | null
        setIsSubmitting(false)
        if (!res.ok || !body?.data) {
            setError(body?.error ?? 'Ошибка')
            return
        }
        setRules((prev) => [...prev, body.data!].sort((a, b) => b.daysBefore - a.daysBefore))
        setDaysInput(2)
    }

    async function removeRule(ruleId: string) {
        setError(null)
        const res = await fetch(`/api/reminder-rules/${ruleId}`, { method: 'DELETE' })
        if (!res.ok) return
        setRules((prev) => prev.filter((r) => r.id !== ruleId))
    }

    async function toggleRule(rule: ReminderRuleItem) {
        setError(null)
        const res = await fetch(`/api/reminder-rules/${rule.id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ isActive: !rule.isActive }),
        })
        const body = (await res.json().catch(() => null)) as { data?: ReminderRuleItem } | null
        if (!res.ok || !body?.data) return
        setRules((prev) =>
            prev.map((r) => (r.id === body.data!.id ? { ...r, isActive: body.data!.isActive } : r)),
        )
    }

    const content = (
        <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground text-xs whitespace-nowrap">Напом.</span>
            <input
                type="number"
                min={0}
                max={90}
                className={inputBase}
                value={daysInput}
                onChange={(e) => setDaysInput(Number(e.target.value) || 0)}
            />
            <span className="text-muted-foreground text-xs">дн.</span>
            <Button type="button" size="sm" className="h-6 px-2 text-xs" disabled={isSubmitting} onClick={addRule}>
                +
            </Button>
            {rules.map((rule) => (
                <span
                    key={rule.id}
                    className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs ${
                        rule.isActive ? 'bg-primary/10' : 'bg-muted/50 text-muted-foreground'
                    }`}
                >
                    {rule.daysBefore}д
                    <button type="button" className="hover:opacity-80 rounded p-0.5" onClick={() => toggleRule(rule)} title={rule.isActive ? 'Выкл' : 'Вкл'}>
                        {rule.isActive ? '✓' : '○'}
                    </button>
                    <button type="button" className="hover:bg-destructive/20 rounded p-0.5" onClick={() => removeRule(rule.id)} title="Удалить">
                        ×
                    </button>
                </span>
            ))}
        </div>
    )

    if (embedded) {
        return (
            <div className="space-y-1">
                {content}
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        )
    }

    return (
        <div className="rounded-lg border bg-card p-2">
            {content}
            {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
    )
}
