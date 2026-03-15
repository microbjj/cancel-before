import { NextResponse } from 'next/server'

import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { validateReminderRuleInput } from '@/lib/reminder-rules'

export const runtime = 'nodejs'

type ReminderRuleByIdRouteParams = {
    params: Promise<{
        id: string
    }>
}

export async function PATCH(request: Request, { params }: ReminderRuleByIdRouteParams) {
    const session = await getAuthSession()
    const userId = session?.user?.id
    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    const { id } = await params
    const existing = await db.reminderRule.findFirst({
        where: { id, userId },
    })
    if (!existing) {
        return NextResponse.json({ error: 'Правило напоминания не найдено.' }, { status: 404 })
    }

    let payload: unknown
    try {
        payload = await request.json()
    } catch {
        return NextResponse.json({ error: 'Неверный формат данных.' }, { status: 400 })
    }

    const validation = validateReminderRuleInput(payload, { partial: true })
    if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const updated = await db.reminderRule.update({
        where: { id },
        data: validation.data,
    })

    return NextResponse.json({ data: updated }, { status: 200 })
}

export async function DELETE(_: Request, { params }: ReminderRuleByIdRouteParams) {
    const session = await getAuthSession()
    const userId = session?.user?.id
    if (!userId) {
        return NextResponse.json({ error: 'Войдите в аккаунт.' }, { status: 401 })
    }

    const { id } = await params
    const deleted = await db.reminderRule.deleteMany({
        where: { id, userId },
    })
    if (deleted.count === 0) {
        return NextResponse.json({ error: 'Правило напоминания не найдено.' }, { status: 404 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
}
