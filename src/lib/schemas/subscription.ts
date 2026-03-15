import { z } from 'zod'

import { BillingCycle, SubscriptionStatus } from '@/generated/prisma/enums'

const billingCycleValues = Object.values(BillingCycle)
const subscriptionStatusValues = Object.values(SubscriptionStatus)

function optionalDateSchema() {
    return z.unknown().optional().transform((value, ctx) => {
        if (value === undefined) {
            return undefined
        }

        if (value === null) {
            return null
        }

        // Пустая строка из полей date input = «нет значения»
        if (typeof value === 'string' && value.trim() === '') {
            return null
        }

        // Уже Date (например, после мержа при PATCH)
        if (value instanceof Date) {
            if (Number.isNaN(value.getTime())) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Некорректная дата.',
                })
                return z.NEVER
            }
            return value
        }

        if (typeof value !== 'string') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Дата должна быть в формате ISO или пусто.',
            })
            return z.NEVER
        }

        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Некорректная дата.',
            })
            return z.NEVER
        }

        return parsed
    })
}

const baseSubscriptionSchema = z
    .object({
        name: z.unknown().transform((value, ctx) => {
            if (typeof value !== 'string' || value.trim().length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Укажите название.',
                })
                return z.NEVER
            }

            return value.trim()
        }),
        billingCycle: z
            .unknown()
            .optional()
            .transform((value, ctx) => {
                if (value === undefined) {
                    return undefined
                }

                if (
                    typeof value !== 'string' ||
                    !billingCycleValues.includes(value as BillingCycle)
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Период должен быть: ${billingCycleValues.join(', ')}.`,
                    })
                    return z.NEVER
                }

                return value as BillingCycle
            }),
        status: z
            .unknown()
            .optional()
            .transform((value, ctx) => {
                if (value === undefined) {
                    return undefined
                }

                if (
                    typeof value !== 'string' ||
                    !subscriptionStatusValues.includes(value as SubscriptionStatus)
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: `Статус должен быть: ${subscriptionStatusValues.join(', ')}.`,
                    })
                    return z.NEVER
                }

                return value as SubscriptionStatus
            }),
        amountCents: z
            .unknown()
            .optional()
            .transform((value, ctx) => {
                if (value === undefined || value === null) {
                    return value
                }

                if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Сумма должна быть неотрицательным числом.',
                    })
                    return z.NEVER
                }

                return value
            }),
        currency: z
            .unknown()
            .optional()
            .transform((value, ctx) => {
                if (value === undefined) {
                    return undefined
                }

                if (typeof value !== 'string' || value.trim().length !== 3) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Валюта — 3 буквы (например, RUB, USD).',
                    })
                    return z.NEVER
                }

                return value.trim().toUpperCase()
            }),
        cancelByAt: optionalDateSchema(),
    })
    .strip()

export const subscriptionCreateSchema = baseSubscriptionSchema

export const subscriptionPartialSchema = baseSubscriptionSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Укажите хотя бы одно поле для изменения.',
    })

export const subscriptionFormSchema = z
    .object({
        name: z.string().trim().min(1, 'Укажите название.'),
        billingCycle: z.enum(billingCycleValues as [BillingCycle, ...BillingCycle[]]),
        status: z.enum(subscriptionStatusValues as [SubscriptionStatus, ...SubscriptionStatus[]]),
        amount: z.string().trim(),
        currency: z.string().trim().min(3).max(3),
        cancelByAt: z.string(),
    })
    .transform((value, ctx) => {
        const amountCents = normalizeAmountToCents(value.amount)
        if (Number.isNaN(amountCents)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Сумма должна быть неотрицательным числом.',
                path: ['amount'],
            })
            return z.NEVER
        }

        const normalizedPayload = {
            name: value.name,
            billingCycle: value.billingCycle,
            status: value.status,
            amountCents,
            currency: value.currency,
            cancelByAt: toNullableIsoDate(value.cancelByAt),
        }

        const parsed = subscriptionCreateSchema.safeParse(normalizedPayload)
        if (!parsed.success) {
            const issue = parsed.error.issues[0]
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: issue?.message ?? 'Неверные данные.',
                path: issue?.path ?? [],
            })
            return z.NEVER
        }

        return parsed.data
    })

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>
export type SubscriptionPartialInput = z.infer<typeof subscriptionPartialSchema>
export type SubscriptionFormInput = z.input<typeof subscriptionFormSchema>

function normalizeAmountToCents(value: string): number | null {
    if (!value) {
        return null
    }

    const parsed = Number.parseFloat(value)
    if (!Number.isFinite(parsed) || parsed < 0) {
        return Number.NaN
    }

    return Math.round(parsed * 100)
}

function toNullableIsoDate(value: string): string | null {
    return value ? new Date(`${value}T12:00:00.000Z`).toISOString() : null
}
