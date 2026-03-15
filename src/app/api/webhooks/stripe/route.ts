import { NextResponse } from 'next/server'

import { Prisma } from '@/generated/prisma/client'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

type StripeEventLike = {
    id: string
    type: string
}

function isStripeEventLike(value: unknown): value is StripeEventLike {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Record<string, unknown>
    return typeof candidate.id === 'string' && typeof candidate.type === 'string'
}

export async function POST(request: Request) {
    const stripeSignature = request.headers.get('stripe-signature')
    if (!stripeSignature) {
        return NextResponse.json(
            { error: 'Missing required stripe-signature header.' },
            { status: 400 },
        )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json(
            { error: 'Server misconfiguration: STRIPE_WEBHOOK_SECRET is not set.' },
            { status: 500 },
        )
    }

    const rawBody = await request.text()
    if (!rawBody) {
        return NextResponse.json({ error: 'Request body is required.' }, { status: 400 })
    }

    let parsedBody: unknown
    try {
        parsedBody = JSON.parse(rawBody)
    } catch {
        return NextResponse.json({ error: 'Body must be valid JSON.' }, { status: 400 })
    }

    if (!isStripeEventLike(parsedBody)) {
        return NextResponse.json(
            { error: 'Body must contain string fields: id and type.' },
            { status: 400 },
        )
    }

    try {
        await db.webhookEvent.upsert({
            where: { externalEventId: parsedBody.id },
            update: {
                eventType: parsedBody.type,
                payload: parsedBody as Prisma.InputJsonValue,
            },
            create: {
                externalEventId: parsedBody.id,
                eventType: parsedBody.type,
                payload: parsedBody as Prisma.InputJsonValue,
            },
        })

        return NextResponse.json({ ok: true }, { status: 200 })
    } catch (error) {
        console.error('Failed to persist Stripe webhook event:', error)
        return NextResponse.json({ error: 'Failed to process webhook event.' }, { status: 500 })
    }
}
