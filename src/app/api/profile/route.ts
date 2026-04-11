import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'

const schema = z
    .object({
        name: z.string().max(100).optional(),
        currentPassword: z.string().optional(),
        newPassword: z.string().min(8).optional(),
    })
    .refine(
        (d) => {
            // если задан newPassword — currentPassword обязателен
            if (d.newPassword && !d.currentPassword) return false
            return true
        },
        { message: 'Укажите текущий пароль.', path: ['currentPassword'] },
    )

export async function PATCH(req: Request) {
    const session = await getAuthSession()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Не авторизован.' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? 'Некорректные данные.'
        return NextResponse.json({ error: message }, { status: 400 })
    }

    const { name, currentPassword, newPassword } = parsed.data

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
        return NextResponse.json({ error: 'Пользователь не найден.' }, { status: 404 })
    }

    const data: { name?: string; passwordHash?: string } = {}

    if (name !== undefined) {
        data.name = name.trim() || (null as unknown as string)
    }

    if (newPassword) {
        if (!user.passwordHash) {
            return NextResponse.json({ error: 'Смена пароля недоступна.' }, { status: 400 })
        }
        const valid = await bcrypt.compare(currentPassword!, user.passwordHash)
        if (!valid) {
            return NextResponse.json({ error: 'Неверный текущий пароль.' }, { status: 400 })
        }
        data.passwordHash = await bcrypt.hash(newPassword, 12)
    }

    await db.user.update({ where: { id: session.user.id }, data })

    return NextResponse.json({ ok: true })
}
