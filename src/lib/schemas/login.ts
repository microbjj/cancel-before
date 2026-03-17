import { z } from 'zod'

export const loginEmailSchema = z.email('Введите корректный email.').trim().toLowerCase()

export const loginCredentialsSchema = z.object({
    email: loginEmailSchema,
    password: z.string().min(1, 'Введите пароль.'),
})

export type LoginCredentialsInput = z.input<typeof loginCredentialsSchema>
export type LoginCredentials = z.output<typeof loginCredentialsSchema>
