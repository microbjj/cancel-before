import { NextResponse } from 'next/server'

import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAuthSession()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Не авторизован.' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Недостаточно прав.' }, { status: 403 })
    }

    const { id } = await params

    if (id === session.user.id) {
        return NextResponse.json({ error: 'Нельзя удалить собственный аккаунт.' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
        return NextResponse.json({ error: 'Пользователь не найден.' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ ok: true })
}
