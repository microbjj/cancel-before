import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ReminderRulesManager } from '@/components/subscriptions/reminder-rules-manager'
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { Container } from '@/components/shared/container'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth'

type SubscriptionDetailsPageProps = {
    params: Promise<{
        id: string
    }>
}

function toInputDateValue(date: Date | null): string {
    if (!date) {
        return ''
    }

    return date.toISOString().slice(0, 10)
}

export default async function SubscriptionDetailsPage({ params }: SubscriptionDetailsPageProps) {
    const session = await getAuthSession()
    const userId = session?.user?.id
    if (!userId) {
        return null
    }

    const { id } = await params
    const subscription = await db.subscription.findFirst({
        where: { id, userId },
        include: {
            reminderRules: {
                orderBy: { daysBefore: 'desc' },
            },
        },
    })

    if (!subscription) {
        notFound()
    }

    return (
        <Container className="py-10">
            <section className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Детали подписки</h1>
                    <p className="text-muted-foreground">
                        Редактируйте данные подписки и настраивайте правила напоминаний.
                    </p>
                </div>

                <SubscriptionForm
                    mode="edit"
                    initialValues={{
                        id: subscription.id,
                        name: subscription.name,
                        billingCycle: subscription.billingCycle,
                        status: subscription.status === 'CANCELED' ? 'CANCELED' : 'ACTIVE',
                        amountCents: subscription.amountCents,
                        currency: subscription.currency,
                        cancelByAt: toInputDateValue(subscription.cancelByAt),
                    }}
                />

                <ReminderRulesManager
                    subscriptionId={subscription.id}
                    initialRules={subscription.reminderRules.map((rule) => ({
                        id: rule.id,
                        daysBefore: rule.daysBefore,
                        isActive: rule.isActive,
                    }))}
                />

                <div className="flex items-center gap-4 text-sm">
                    <Link href="/dashboard" className="underline underline-offset-4">
                        Вернуться на панель
                    </Link>
                    <Link href="/dashboard" className="underline underline-offset-4">
                        Добавить подписку
                    </Link>
                </div>
            </section>
        </Container>
    )
}
