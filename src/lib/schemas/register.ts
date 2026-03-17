import { z } from 'zod'

import { loginEmailSchema } from './login'

export const registerSchema = z
    .object({
        email: loginEmailSchema,
        name: z.string().trim().min(1, 'Введите имя.'),
        password: z.string().min(8, 'Пароль должен содержать не менее 8 символов.'),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Пароли не совпадают.',
        path: ['confirmPassword'],
    })

export type RegisterInput = z.input<typeof registerSchema>
export type Register = z.output<typeof registerSchema>
