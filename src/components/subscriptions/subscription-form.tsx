'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { type Resolver, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    subscriptionFormSchema,
    type SubscriptionCreateInput,
    type SubscriptionFormInput,
} from '@/lib/schemas/subscription'

type SubscriptionFormMode = 'create' | 'edit'

type SubscriptionFormValues = {
    id?: string
    name: string
    billingCycle: 'MONTHLY' | 'YEARLY'
    status: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'TRIAL'
    amountCents: number | null
    currency: string
    cancelByAt: string
}

type SubscriptionFormProps = {
    mode: SubscriptionFormMode
    initialValues?: SubscriptionFormValues
    redirectToAfterCreate?: string
    compact?: boolean
    embedded?: boolean
    trailingRow2?: ReactNode
    cardStyle?: boolean
    formId?: string
    onSuccess?: () => void
}

const billingCycleOptions = [
    { value: 'MONTHLY', label: 'Месяц' },
    { value: 'YEARLY', label: 'Год' },
] as const

const statusOptions = [
    { value: 'ACTIVE', label: 'Активна' },
    { value: 'CANCELED', label: 'Отменена' },
] as const

const defaultValues: SubscriptionFormValues = {
    name: '',
    billingCycle: 'MONTHLY',
    status: 'ACTIVE',
    amountCents: null,
    currency: 'RUB',
    cancelByAt: '',
}

const inputBase =
    'rounded border border-border bg-transparent text-sm text-light placeholder:text-grays focus:border-primary focus:outline-none'

// px/py намеренно не включены — задаются в месте использования
const selectBase =
    'rounded border border-border bg-transparent text-sm text-light focus:border-primary focus:outline-none [color-scheme:dark]'

export function SubscriptionForm({
    mode,
    initialValues,
    redirectToAfterCreate,
    compact,
    embedded,
    trailingRow2,
    cardStyle,
    formId,
    onSuccess,
}: SubscriptionFormProps) {
    const router = useRouter()
    const values = useMemo(() => initialValues ?? defaultValues, [initialValues])
    const formDefaultValues = useMemo<SubscriptionFormInput>(
        () => ({
            name: values.name,
            billingCycle: values.billingCycle,
            status: values.status,
            amount: values.amountCents === null ? '' : String(values.amountCents / 100),
            currency: values.currency,
            cancelByAt: values.cancelByAt,
        }),
        [values],
    )

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SubscriptionFormInput, undefined, SubscriptionCreateInput>({
        resolver: zodResolver(subscriptionFormSchema as never) as Resolver<
            SubscriptionFormInput,
            undefined,
            SubscriptionCreateInput
        >,
        defaultValues: formDefaultValues,
    })

    const [error, setError] = useState<string | null>(null)

    const submitLabel =
        mode === 'create' ? (isSubmitting ? '…' : 'Создать') : isSubmitting ? '…' : 'Сохранить'

    const toDateOrNull = (v: Date | string | null | undefined): string | null => {
        if (v == null || v === '') return null
        if (v instanceof Date) return v.toISOString()
        return String(v)
    }

    const onSubmit = handleSubmit(
        async (formValues) => {
            setError(null)
            try {
                const endpoint =
                    mode === 'create' ? '/api/subscriptions' : `/api/subscriptions/${values.id}`
                const method = mode === 'create' ? 'POST' : 'PATCH'
                const payload = {
                    ...formValues,
                    cancelByAt: toDateOrNull(
                        formValues.cancelByAt as Date | string | null | undefined,
                    ),
                }
                const response = await fetch(endpoint, {
                    method,
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                const res = (await response.json().catch(() => null)) as {
                    error?: string
                    data?: { id: string }
                } | null
                if (!response.ok) {
                    setError(res?.error ?? 'Не удалось сохранить.')
                    return
                }
                if (mode === 'create') {
                    router.push(redirectToAfterCreate ?? `/subscriptions/${res?.data?.id ?? ''}`)
                    router.refresh()
                    return
                }
                toast.success('Сохранено')
                onSuccess?.()
                router.refresh()
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Ошибка при сохранении')
            }
        },
        (err) => {
            setError(
                Object.values(err).find((e) => e?.message)?.message ??
                    'Исправьте ошибки в полях формы.',
            )
        },
    )

    if (cardStyle) {
        return (
            <form id={formId} onSubmit={onSubmit} className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Input className="flex-1" placeholder="Название" {...register('name')} />
                    <Input
                        type="number"
                        min={0}
                        step={0.01}
                        className="w-20"
                        placeholder="0"
                        {...register('amount')}
                    />
                    <Input
                        className="w-14 uppercase"
                        placeholder="RUB"
                        maxLength={3}
                        {...register('currency')}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        className={`${selectBase} min-w-[88px] flex-1 px-2 py-1.5`}
                        {...register('billingCycle')}
                    >
                        {billingCycleOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <select
                        className={`${selectBase} min-w-[104px] flex-1 px-2 py-1.5`}
                        {...register('status')}
                    >
                        {statusOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className={`${inputBase} min-w-[140px] flex-1 px-3 py-1.5 [color-scheme:dark]`}
                        {...register('cancelByAt')}
                    />
                    {trailingRow2}
                </div>
                {(errors.name ?? errors.amount ?? errors.currency ?? errors.cancelByAt) && (
                    <p className="text-xs text-red-400">
                        {errors.name?.message ??
                            errors.amount?.message ??
                            errors.currency?.message ??
                            errors.cancelByAt?.message}
                    </p>
                )}
                {error && <p className="text-xs text-red-400">{error}</p>}
            </form>
        )
    }

    const size = compact ? 'text-xs py-1 px-2' : 'text-sm py-1.5 px-3'
    const formClass = embedded ? 'contents' : `border border-border ${compact ? 'p-3' : 'p-4'}`

    return (
        <form onSubmit={onSubmit} className={formClass}>
            <div className="flex flex-wrap items-center gap-2">
                <input
                    className={`${inputBase} ${size} min-w-0 flex-1 basis-24`}
                    placeholder="Название"
                    {...register('name')}
                />
                <div className="border-border flex items-center border">
                    <input
                        type="number"
                        min={0}
                        step={0.01}
                        className={`${inputBase} w-24 border-0 ${size}`}
                        placeholder="0"
                        {...register('amount')}
                    />
                    <input
                        className={`${inputBase} border-border w-14 border-0 border-l px-2 py-1.5 text-center uppercase`}
                        placeholder="RUB"
                        maxLength={3}
                        {...register('currency')}
                    />
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-grays text-xs whitespace-nowrap">до</span>
                    <input
                        type="date"
                        className={`${inputBase} ${size} min-w-[140px] flex-1 [color-scheme:dark]`}
                        {...register('cancelByAt')}
                    />
                </div>
            </div>
            <div className={`flex flex-wrap items-center gap-2 ${embedded ? '' : 'mt-2'}`}>
                <select className={`${selectBase} w-24 px-2 py-1.5`} {...register('billingCycle')}>
                    {billingCycleOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <select className={`${selectBase} w-28 px-2 py-1.5`} {...register('status')}>
                    {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                    {submitLabel}
                </Button>
                {trailingRow2}
            </div>
            {(errors.name ?? errors.amount ?? errors.currency ?? errors.cancelByAt) && (
                <p className="mt-1.5 text-xs text-red-400">
                    {errors.name?.message ??
                        errors.amount?.message ??
                        errors.currency?.message ??
                        errors.cancelByAt?.message}
                </p>
            )}
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        </form>
    )
}
