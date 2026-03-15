import { ZodError } from 'zod'

import type { ReminderRuleInput, ReminderRulePartialInput } from '@/lib/schemas/reminder-rule'
import { reminderRuleCreateSchema, reminderRulePartialSchema } from '@/lib/schemas/reminder-rule'

type ValidationResult<T> =
    | {
          ok: true
          data: T
      }
    | {
          ok: false
          error: string
      }

type ValidateOptions = {
    partial?: boolean
}

function getZodErrorMessage(error: ZodError): string {
    return error.issues[0]?.message ?? 'Неверные данные.'
}

export function validateReminderRuleInput(
    payload: unknown,
    options?: {
        partial?: false
    },
): ValidationResult<ReminderRuleInput>
export function validateReminderRuleInput(
    payload: unknown,
    options: {
        partial: true
    },
): ValidationResult<ReminderRulePartialInput>
export function validateReminderRuleInput(
    payload: unknown,
    options: ValidateOptions = {},
): ValidationResult<ReminderRuleInput | ReminderRulePartialInput> {
    const { partial = false } = options

    if (!payload || typeof payload !== 'object') {
        return { ok: false, error: 'Тело запроса должно быть JSON-объектом.' }
    }

    const schema = partial ? reminderRulePartialSchema : reminderRuleCreateSchema
    const parsed = schema.safeParse(payload)
    if (!parsed.success) {
        return {
            ok: false,
            error: getZodErrorMessage(parsed.error),
        }
    }

    return { ok: true, data: parsed.data }
}
