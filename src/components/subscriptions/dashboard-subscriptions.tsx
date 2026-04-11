'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
    ReminderRulesInline,
    type ReminderRuleItem,
} from '@/components/subscriptions/reminder-rules-inline'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'

/** Данные подписки в виде, пригодном для передачи с сервера (даты — ISO строки) */
export type SubscriptionListItem = {
    id: string
    name: string
    billingCycle: 'MONTHLY' | 'YEARLY'
    status: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'TRIAL'
    amountCents: number | null
    currency: string
    cancelByAt: string | null
    reminderRulesCount: number
    reminderRules: ReminderRuleItem[]
}

function toInputDateValue(dateStr: string | null): string {
    if (!dateStr) return ''
    return dateStr.slice(0, 10)
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—'
    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(dateStr))
}

const CURRENCY_SYMBOLS: Record<string, string> = { RUB: '₽', USD: '$', EUR: '€' }

function formatAmount(amountCents: number | null, currency: string): string {
    if (amountCents == null) return '—'
    const value = (amountCents / 100).toLocaleString('ru-RU', { maximumFractionDigits: 0 })
    const sym = CURRENCY_SYMBOLS[currency] ?? currency
    return `${value} ${sym}`
}

type SubscriptionRowProps = {
    subscription: SubscriptionListItem
}

function SubscriptionRow({ subscription }: SubscriptionRowProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const initialValues = {
        id: subscription.id,
        name: subscription.name,
        billingCycle: subscription.billingCycle,
        status: (subscription.status === 'CANCELED' ? 'CANCELED' : 'ACTIVE') as
            | 'ACTIVE'
            | 'CANCELED',
        amountCents: subscription.amountCents,
        currency: subscription.currency,
        cancelByAt: toInputDateValue(subscription.cancelByAt),
    }

    return (
        <li className="border-border -mt-px border first:mt-0">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-light text-sm">{subscription.name}</span>
                    <span className="text-grays text-sm">
                        {formatAmount(subscription.amountCents, subscription.currency)}
                    </span>
                    <span className="text-grays text-sm">
                        до {formatDate(subscription.cancelByAt)}
                    </span>
                    {subscription.reminderRulesCount > 0 && (
                        <span className="text-grays text-xs">
                            напом. {subscription.reminderRulesCount}
                        </span>
                    )}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing((v) => !v)}
                >
                    {isEditing ? 'Свернуть' : 'Редактировать'}
                </Button>
            </div>
            {isEditing && (
                <div className="border-border space-y-4 border-t p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
                        <div className="min-w-0 flex-1">
                            <SubscriptionForm
                                mode="edit"
                                initialValues={initialValues}
                                cardStyle
                                formId={`sub-form-${subscription.id}`}
                                onSuccess={() => setIsEditing(false)}
                            />
                        </div>
                        <div className="border-border w-full border-t pt-4 sm:w-auto sm:max-w-xs sm:min-w-[200px] sm:flex-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
                            <p className="text-grays mb-2 text-xs">Напоминания</p>
                            <ReminderRulesInline
                                embedded
                                subscriptionId={subscription.id}
                                initialRules={subscription.reminderRules}
                            />
                        </div>
                        <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                    (
                                        document.getElementById(
                                            `sub-form-${subscription.id}`,
                                        ) as HTMLFormElement | null
                                    )?.requestSubmit()
                                }
                            >
                                Сохранить
                            </Button>
                            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={isDeleting}
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    {isDeleting ? '…' : 'Удалить'}
                                </Button>
                                <AlertDialogContent className="max-w-md">
                                    <AlertDialogHeader>
                                        <div className="flex size-8 items-center justify-center text-red-400">
                                            <Trash2 className="size-4" />
                                        </div>
                                        <AlertDialogTitle>Удалить подписку?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Подписка «{subscription.name}» и все связанные
                                            напоминания будут удалены. Это действие нельзя отменить.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="border-red-500 bg-red-500 text-white hover:opacity-80"
                                            disabled={isDeleting}
                                            onClick={async () => {
                                                setIsDeleting(true)
                                                const res = await fetch(
                                                    `/api/subscriptions/${subscription.id}`,
                                                    {
                                                        method: 'DELETE',
                                                    },
                                                )
                                                setIsDeleting(false)
                                                if (res.ok) {
                                                    setDeleteDialogOpen(false)
                                                    setIsEditing(false)
                                                    router.refresh()
                                                }
                                            }}
                                        >
                                            {isDeleting ? 'Удаление…' : 'Удалить'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            )}
        </li>
    )
}

type DashboardSubscriptionsProps = {
    subscriptions: SubscriptionListItem[]
}

export function DashboardSubscriptions({ subscriptions }: DashboardSubscriptionsProps) {
    const [showAddForm, setShowAddForm] = useState(false)

    return (
        <section className="space-y-4">
            <div className="flex min-w-0 items-center justify-between">
                <p className="text-light text-sm font-medium">Мои подписки</p>
                <Button size="sm" onClick={() => setShowAddForm((v) => !v)}>
                    {showAddForm ? 'Отмена' : 'Добавить'}
                </Button>
            </div>

            {showAddForm && (
                <div className="border-border border p-4">
                    <SubscriptionForm mode="create" redirectToAfterCreate="/dashboard" />
                </div>
            )}

            {subscriptions.length === 0 && !showAddForm ? (
                <div className="border-border border border-dashed p-6">
                    <p className="text-light text-xs font-medium">Пока нет подписок.</p>
                    <p className="text-grays mt-1 text-xs">
                        Нажмите «Добавить», чтобы отслеживать даты отмены.
                    </p>
                </div>
            ) : (
                <ul className="space-y-0">
                    {subscriptions.map((sub) => (
                        <SubscriptionRow key={sub.id} subscription={sub} />
                    ))}
                </ul>
            )}
        </section>
    )
}
