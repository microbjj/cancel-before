import { z } from 'zod'

export const MAX_DAYS_BEFORE = 90

const baseReminderRuleSchema = z
    .object({
        daysBefore: z.unknown().transform((value, ctx) => {
            if (
                typeof value !== 'number' ||
                !Number.isInteger(value) ||
                value < 0 ||
                value > MAX_DAYS_BEFORE
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Количество дней — целое число от 0 до ${MAX_DAYS_BEFORE}.`,
                })
                return z.NEVER
            }

            return value
        }),
        isActive: z.unknown().optional().transform((value, ctx) => {
            if (value === undefined) {
                return undefined
            }

            if (typeof value !== 'boolean') {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Поле isActive должно быть true или false.',
                })
                return z.NEVER
            }

            return value
        }),
    })
    .strip()

export const reminderRuleCreateSchema = baseReminderRuleSchema

export const reminderRulePartialSchema = baseReminderRuleSchema
    .partial()
    .refine((value) => Object.keys(value).length > 0, {
        message: 'Укажите хотя бы одно поле для изменения.',
    })

export type ReminderRuleInput = z.infer<typeof reminderRuleCreateSchema>
export type ReminderRulePartialInput = z.infer<typeof reminderRulePartialSchema>
