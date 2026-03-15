import { z } from 'zod'

export const loginEmailSchema = z.email('Введите корректный email.').trim().toLowerCase()

export const loginCredentialsSchema = z.object({
    email: loginEmailSchema,
    name: z
        .string()
        .trim()
        .optional()
        .transform((value) => (value ? value : null)),
})

export type LoginCredentialsInput = z.input<typeof loginCredentialsSchema>
export type LoginCredentials = z.output<typeof loginCredentialsSchema>
