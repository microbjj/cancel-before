import { ZodError } from 'zod'

import type { SubscriptionCreateInput, SubscriptionPartialInput } from '@/lib/schemas/subscription'
import { subscriptionCreateSchema, subscriptionPartialSchema } from '@/lib/schemas/subscription'

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

export function validateSubscriptionInput(
    payload: unknown,
    options?: {
        partial?: false
    },
): ValidationResult<SubscriptionCreateInput>
export function validateSubscriptionInput(
    payload: unknown,
    options: {
        partial: true
    },
): ValidationResult<SubscriptionPartialInput>
export function validateSubscriptionInput(
    payload: unknown,
    options: ValidateOptions = {},
): ValidationResult<SubscriptionCreateInput | SubscriptionPartialInput> {
    const { partial = false } = options

    if (!payload || typeof payload !== 'object') {
        return { ok: false, error: 'Тело запроса должно быть JSON-объектом.' }
    }
    const schema = partial ? subscriptionPartialSchema : subscriptionCreateSchema
    const parsed = schema.safeParse(payload)
    if (!parsed.success) {
        return {
            ok: false,
            error: getZodErrorMessage(parsed.error),
        }
    }

    return {
        ok: true,
        data: parsed.data,
    }
}
