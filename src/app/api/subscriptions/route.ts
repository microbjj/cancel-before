import { NextResponse } from 'next/server'

import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { validateSubscriptionInput } from '@/lib/subscriptions'

export const runtime = 'nodejs'

export async function GET() {
    const session = await getAuthSession()
    const userId = session?.user?.id

    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    const subscriptions = await db.subscription.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ data: subscriptions }, { status: 200 })
}

export async function POST(request: Request) {
    const session = await getAuthSession()
    const userId = session?.user?.id

    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    let payload: unknown
    try {
        payload = await request.json()
    } catch {
        return NextResponse.json({ error: 'Неверный формат данных.' }, { status: 400 })
    }

    const validation = validateSubscriptionInput(payload)
    if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const created = await db.subscription.create({
        data: {
            name: validation.data.name,
            billingCycle: validation.data.billingCycle,
            status: validation.data.status,
            amountCents: validation.data.amountCents,
            currency: validation.data.currency,
            cancelByAt: validation.data.cancelByAt,
            userId,
        },
    })

    await db.reminderRule.create({
        data: {
            subscriptionId: created.id,
            userId,
            daysBefore: 2,
            isActive: true,
        },
    })

    return NextResponse.json({ data: created }, { status: 201 })
}
