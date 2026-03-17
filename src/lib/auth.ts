import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { AUTH_SECRET } from '@/lib/auth-secret'
import { db } from '@/lib/db'
import { loginCredentialsSchema } from '@/lib/schemas/login'

export const authOptions: NextAuthOptions = {
    secret: AUTH_SECRET,
    session: {
        strategy: 'jwt',
    },
    providers: [
        CredentialsProvider({
            name: 'Email',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const parsed = loginCredentialsSchema.safeParse({
                    email: credentials?.email,
                    password: credentials?.password,
                })
                if (!parsed.success) {
                    return null
                }

                const { email, password } = parsed.data

                const user = await db.user.findUnique({ where: { email } })
                if (!user || !user.passwordHash) {
                    return null
                }

                const valid = await bcrypt.compare(password, user.passwordHash)
                if (!valid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user?.id) {
                token.sub = user.id
            }

            return token
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }

            return session
        },
    },
    pages: {
        signIn: '/login',
    },
}

export function getAuthSession() {
    return getServerSession(authOptions)
}
