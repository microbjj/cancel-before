import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

import { db } from '@/lib/db'
import { registerSchema } from '@/lib/schemas/register'

export async function POST(request: Request) {
    const body: unknown = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 })
    }

    const { email, name, password } = parsed.data
    const passwordHash = await bcrypt.hash(password, 12)

    const existing = await db.user.findUnique({ where: { email } })

    if (existing) {
        if (existing.passwordHash) {
            return NextResponse.json({ error: 'Email уже зарегистрирован.' }, { status: 409 })
        }
        await db.user.update({ where: { email }, data: { name, passwordHash } })
    } else {
        await db.user.create({ data: { email, name, passwordHash } })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
}
