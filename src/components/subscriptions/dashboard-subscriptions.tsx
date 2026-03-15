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
import { Card, CardContent } from '@/components/ui/card'
import { ReminderRulesInline, type ReminderRuleItem } from '@/components/subscriptions/reminder-rules-inline'
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
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
        new Date(dateStr)
    )
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
        status: (subscription.status === 'CANCELED' ? 'CANCELED' : 'ACTIVE') as 'ACTIVE' | 'CANCELED',
        amountCents: subscription.amountCents,
        currency: subscription.currency,
        cancelByAt: toInputDateValue(subscription.cancelByAt),
    }

    return (
        <li className="rounded-md border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                    <span className="font-medium">{subscription.name}</span>
                    <span className="text-muted-foreground">{formatAmount(subscription.amountCents, subscription.currency)}</span>
                    <span className="text-muted-foreground">отменить до {formatDate(subscription.cancelByAt)}</span>
                    {subscription.reminderRulesCount > 0 && (
                        <span className="text-muted-foreground text-xs">напом. {subscription.reminderRulesCount}</span>
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
                <div className="mt-3">
                    <Card className="w-full">
                        <CardContent className="p-3">
                            <div className="flex flex-wrap items-start gap-4">
                                <div className="min-w-0 flex-1">
                                    <SubscriptionForm
                                        mode="edit"
                                        initialValues={initialValues}
                                        cardStyle
                                        formId={`sub-form-${subscription.id}`}
                                        onSuccess={() => setIsEditing(false)}
                                    />
                                </div>
                                <div className="flex min-w-[200px] flex-1 max-w-[320px] flex-col justify-center border-x border-border px-4">
                                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">Напоминания</p>
                                        <ReminderRulesInline
                                            embedded
                                            subscriptionId={subscription.id}
                                            initialRules={subscription.reminderRules}
                                        />
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-col gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => (document.getElementById(`sub-form-${subscription.id}`) as HTMLFormElement | null)?.requestSubmit()}
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
                                        <AlertDialogContent className="sm:max-w-md">
                                            <AlertDialogHeader>
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                                    <Trash2 className="size-5" />
                                                </div>
                                                <AlertDialogTitle>Удалить подписку?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Подписка «{subscription.name}» и все связанные напоминания будут удалены. Это действие нельзя отменить.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="gap-2 sm:gap-0">
                                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    disabled={isDeleting}
                                                    onClick={async () => {
                                                        setIsDeleting(true)
                                                        const res = await fetch(`/api/subscriptions/${subscription.id}`, {
                                                            method: 'DELETE',
                                                        })
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
                        </CardContent>
                    </Card>
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
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Мои подписки</h2>
                <Button onClick={() => setShowAddForm((v) => !v)}>
                    {showAddForm ? 'Отмена' : 'Добавить подписку'}
                </Button>
            </div>

            {showAddForm && (
                <div className="rounded-md border p-4">
                    <SubscriptionForm mode="create" redirectToAfterCreate="/dashboard" />
                </div>
            )}

            {subscriptions.length === 0 && !showAddForm ? (
                <div className="rounded-md border border-dashed p-6 text-sm">
                    <p className="font-medium">Пока нет подписок.</p>
                    <p className="text-muted-foreground mt-1">
                        Нажмите «Добавить подписку», чтобы отслеживать даты отмены.
                    </p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {subscriptions.map((sub) => (
                        <SubscriptionRow key={sub.id} subscription={sub} />
                    ))}
                </ul>
            )}
        </section>
    )
}
