import { NextResponse } from 'next/server'

import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { validateSubscriptionInput } from '@/lib/subscriptions'

export const runtime = 'nodejs'

type SubscriptionByIdRouteParams = {
    params: Promise<{
        id: string
    }>
}

export async function GET(_: Request, { params }: SubscriptionByIdRouteParams) {
    const session = await getAuthSession()
    const userId = session?.user?.id

    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    const { id } = await params

    const subscription = await db.subscription.findFirst({
        where: {
            id,
            userId,
        },
        include: {
            reminderRules: {
                orderBy: { daysBefore: 'desc' },
            },
        },
    })

    if (!subscription) {
        return NextResponse.json({ error: 'Подписка не найдена.' }, { status: 404 })
    }

    return NextResponse.json({ data: subscription }, { status: 200 })
}

export async function PATCH(request: Request, { params }: SubscriptionByIdRouteParams) {
    const session = await getAuthSession()
    const userId = session?.user?.id

    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    const { id } = await params

    const existing = await db.subscription.findFirst({
        where: { id, userId },
    })

    if (!existing) {
        return NextResponse.json({ error: 'Подписка не найдена.' }, { status: 404 })
    }

    let payload: unknown
    try {
        payload = await request.json()
    } catch {
        return NextResponse.json({ error: 'Неверный формат данных.' }, { status: 400 })
    }

    const parsedPartial = validateSubscriptionInput(payload, { partial: true })
    if (!parsedPartial.ok) {
        return NextResponse.json({ error: parsedPartial.error }, { status: 400 })
    }

    const mergedPayload = {
        name: parsedPartial.data.name ?? existing.name,
        billingCycle: parsedPartial.data.billingCycle ?? existing.billingCycle,
        status: parsedPartial.data.status ?? existing.status,
        amountCents:
            parsedPartial.data.amountCents !== undefined
                ? parsedPartial.data.amountCents
                : existing.amountCents,
        currency: parsedPartial.data.currency ?? existing.currency,
        cancelByAt:
            parsedPartial.data.cancelByAt !== undefined
                ? parsedPartial.data.cancelByAt
                : existing.cancelByAt,
    }

    const validation = validateSubscriptionInput(mergedPayload)
    if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const subscription = await db.subscription.update({
        where: { id },
        data: validation.data,
        include: {
            reminderRules: {
                orderBy: { daysBefore: 'desc' },
            },
        },
    })

    return NextResponse.json({ data: subscription }, { status: 200 })
}

export async function DELETE(_: Request, { params }: SubscriptionByIdRouteParams) {
    const session = await getAuthSession()
    const userId = session?.user?.id

    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    const { id } = await params

    const result = await db.subscription.deleteMany({
        where: {
            id,
            userId,
        },
    })

    if (result.count === 0) {
        return NextResponse.json({ error: 'Подписка не найдена.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
}
