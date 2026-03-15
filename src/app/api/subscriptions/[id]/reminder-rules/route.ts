import { NextResponse } from 'next/server'

import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { validateReminderRuleInput } from '@/lib/reminder-rules'

export const runtime = 'nodejs'

type ReminderRulesRouteParams = {
    params: Promise<{
        id: string
    }>
}

export async function GET(_: Request, { params }: ReminderRulesRouteParams) {
    const session = await getAuthSession()
    const userId = session?.user?.id
    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    const { id: subscriptionId } = await params
    const subscription = await db.subscription.findFirst({
        where: { id: subscriptionId, userId },
        select: { id: true },
    })
    if (!subscription) {
        return NextResponse.json({ error: 'Подписка не найдена.' }, { status: 404 })
    }

    const rules = await db.reminderRule.findMany({
        where: { subscriptionId, userId },
        orderBy: [{ daysBefore: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ data: rules }, { status: 200 })
}

export async function POST(request: Request, { params }: ReminderRulesRouteParams) {
    const session = await getAuthSession()
    const userId = session?.user?.id
    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    const { id: subscriptionId } = await params
    const subscription = await db.subscription.findFirst({
        where: { id: subscriptionId, userId },
        select: { id: true },
    })
    if (!subscription) {
        return NextResponse.json({ error: 'Подписка не найдена.' }, { status: 404 })
    }

    let payload: unknown
    try {
        payload = await request.json()
    } catch {
        return NextResponse.json({ error: 'Неверный формат данных.' }, { status: 400 })
    }

    const validation = validateReminderRuleInput(payload)
    if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const created = await db.reminderRule.create({
        data: {
            userId,
            subscriptionId,
            daysBefore: validation.data.daysBefore!,
            isActive: validation.data.isActive ?? true,
        },
    })

    return NextResponse.json({ data: created }, { status: 201 })
}
