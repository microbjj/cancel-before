import { NextResponse } from 'next/server'

import { NotificationChannel, SubscriptionStatus } from '@/generated/prisma/enums'
import { db } from '@/lib/db'
import { sendReminderEmail } from '@/lib/notifications'
import { isReminderDueToday, startOfUtcDay, toIsoDate } from '@/lib/reminders'

export const runtime = 'nodejs'

const DEFAULT_LIMIT = 100
const MAX_LIMIT = 1000

type CronPayload = {
    dryRun?: boolean
    limit?: number
}

function normalizePayload(payload: unknown):
    | {
          ok: true
          data: Required<CronPayload>
      }
    | {
          ok: false
          error: string
      } {
    if (!payload) {
        return { ok: true, data: { dryRun: false, limit: DEFAULT_LIMIT } }
    }

    if (typeof payload !== 'object') {
        return { ok: false, error: 'Body must be a JSON object.' }
    }

    const candidate = payload as Record<string, unknown>
    const dryRun = candidate.dryRun
    const limit = candidate.limit

    if (dryRun !== undefined && typeof dryRun !== 'boolean') {
        return { ok: false, error: 'dryRun must be a boolean.' }
    }

    if (
        limit !== undefined &&
        (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT)
    ) {
        return { ok: false, error: `limit must be an integer between 1 and ${MAX_LIMIT}.` }
    }

    return {
        ok: true,
        data: {
            dryRun: typeof dryRun === 'boolean' ? dryRun : false,
            limit: typeof limit === 'number' ? limit : DEFAULT_LIMIT,
        },
    }
}

export async function POST(request: Request) {
    const configuredSecret = process.env.CRON_SECRET
    if (!configuredSecret) {
        return NextResponse.json(
            { error: 'Server misconfiguration: CRON_SECRET is not set.' },
            { status: 500 },
        )
    }

    const providedSecret = request.headers.get('x-cron-secret')
    if (!providedSecret || providedSecret !== configuredSecret) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    let rawPayload: unknown = null
    if (request.headers.get('content-length') !== '0') {
        try {
            rawPayload = await request.json()
        } catch {
            return NextResponse.json({ error: 'Body must be valid JSON.' }, { status: 400 })
        }
    }

    const normalized = normalizePayload(rawPayload)
    if (!normalized.ok) {
        return NextResponse.json({ error: normalized.error }, { status: 400 })
    }

    try {
        const now = new Date()
        const dayStart = startOfUtcDay(now)
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

        const activeRules = await db.reminderRule.findMany({
            where: {
                isActive: true,
                subscription: {
                    cancelByAt: { not: null },
                    status: {
                        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
                    },
                },
            },
            include: {
                user: {
                    select: { email: true, name: true },
                },
                subscription: {
                    select: {
                        id: true,
                        name: true,
                        cancelByAt: true,
                    },
                },
            },
            orderBy: [{ daysBefore: 'desc' }, { createdAt: 'asc' }],
            take: normalized.data.limit,
        })

        const dueRules = activeRules.filter((rule) =>
            isReminderDueToday(rule.subscription.cancelByAt!, rule.daysBefore, now),
        )

        if (dueRules.length === 0) {
            return NextResponse.json({
                ok: true,
                dryRun: normalized.data.dryRun,
                requestedLimit: normalized.data.limit,
                scannedRules: activeRules.length,
                dueRules: 0,
                sent: 0,
                skippedAlreadySent: 0,
                failed: 0,
                message: 'No reminder rules are due today.',
            })
        }

        const existingLogs = await db.notificationLog.findMany({
            where: {
                reminderRuleId: {
                    in: dueRules.map((rule) => rule.id),
                },
                channel: NotificationChannel.EMAIL,
                sentAt: {
                    gte: dayStart,
                    lt: dayEnd,
                },
            },
            select: {
                reminderRuleId: true,
            },
        })

        const alreadySentSet = new Set(
            existingLogs.map((log) => log.reminderRuleId).filter((value): value is string => Boolean(value)),
        )

        let sent = 0
        let skippedAlreadySent = 0
        let failed = 0
        const failedRuleIds: string[] = []

        for (const rule of dueRules) {
            if (alreadySentSet.has(rule.id)) {
                skippedAlreadySent += 1
                continue
            }

            if (normalized.data.dryRun) {
                sent += 1
                continue
            }

            try {
                await sendReminderEmail({
                    to: rule.user.email,
                    subscriptionName: rule.subscription.name,
                    cancelByAt: rule.subscription.cancelByAt!,
                    daysBefore: rule.daysBefore,
                })

                await db.notificationLog.create({
                    data: {
                        userId: rule.userId,
                        subscriptionId: rule.subscription.id,
                        reminderRuleId: rule.id,
                        channel: NotificationChannel.EMAIL,
                        sentAt: new Date(),
                    },
                })

                sent += 1
                alreadySentSet.add(rule.id)
            } catch (error) {
                console.error(`Failed to send reminder for rule ${rule.id}:`, error)
                failed += 1
                failedRuleIds.push(rule.id)
            }
        }

        return NextResponse.json({
            ok: true,
            dryRun: normalized.data.dryRun,
            requestedLimit: normalized.data.limit,
            dayKey: toIsoDate(now),
            scannedRules: activeRules.length,
            dueRules: dueRules.length,
            sent,
            skippedAlreadySent,
            failed,
            failedRuleIds,
        })
    } catch (error) {
        console.error('Failed to execute reminder cron pipeline:', error)
        return NextResponse.json({ error: 'Failed to run reminder cron.' }, { status: 500 })
    }
}
