import { Container } from '@/components/shared/container'
import { DashboardSubscriptions, type SubscriptionListItem } from '@/components/subscriptions/dashboard-subscriptions'
import { db } from '@/lib/db'
import { getAuthSession } from '@/lib/auth'

function formatDate(date: Date | null) {
    if (!date) {
        return 'Не задано'
    }
    return new Intl.DateTimeFormat('ru-RU', {
        dateStyle: 'medium',
    }).format(date)
}

function toIsoOrNull(date: Date | null): string | null {
    if (!date) return null
    return date.toISOString()
}

export default async function DashboardPage() {
    const session = await getAuthSession()
    const userId = session?.user?.id

    if (!userId) {
        return null
    }

    const subscriptions = await db.subscription.findMany({
        where: { userId },
        orderBy: [{ cancelByAt: 'asc' }, { updatedAt: 'desc' }],
        include: {
            reminderRules: {
                select: { id: true, daysBefore: true, isActive: true },
                orderBy: { daysBefore: 'desc' },
            },
        },
    })

    const subscriptionsWithDeadline = subscriptions.filter((item) => item.cancelByAt)
    const nearest = subscriptionsWithDeadline.find((item) => item.cancelByAt && item.cancelByAt >= new Date()) ?? null

    const listItems: SubscriptionListItem[] = subscriptions.map((s) => ({
        id: s.id,
        name: s.name,
        billingCycle: s.billingCycle,
        status: s.status,
        amountCents: s.amountCents,
        currency: s.currency,
        cancelByAt: toIsoOrNull(s.cancelByAt),
        reminderRulesCount: s.reminderRules.filter((r) => r.isActive).length,
        reminderRules: s.reminderRules.map((r) => ({ id: r.id, daysBefore: r.daysBefore, isActive: r.isActive })),
    }))

    return (
        <Container className="max-w-[90rem] py-10">
            <section className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
                    <p className="text-muted-foreground">
                        Подписки, дедлайны отмены и быстрые действия — всё на одной странице.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-md border p-4">
                        <p className="text-muted-foreground text-sm">Всего подписок</p>
                        <p className="text-2xl font-semibold">{subscriptions.length}</p>
                    </div>
                    <div className="rounded-md border p-4">
                        <p className="text-muted-foreground text-sm">С датой отмены</p>
                        <p className="text-2xl font-semibold">{subscriptionsWithDeadline.length}</p>
                    </div>
                    <div className="rounded-md border p-4">
                        <p className="text-muted-foreground text-sm">Ближайшая отмена</p>
                        <p className="text-base font-semibold">
                            {nearest ? `${nearest.name} — ${formatDate(nearest.cancelByAt)}` : 'Пока нет данных'}
                        </p>
                    </div>
                </div>

                <DashboardSubscriptions subscriptions={listItems} />
            </section>
        </Container>
    )
}
