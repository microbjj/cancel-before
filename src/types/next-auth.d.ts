import type { DefaultSession, DefaultUser } from 'next-auth'
import type { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: 'USER' | 'ADMIN'
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        id: string
        role: 'USER' | 'ADMIN'
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        role?: 'USER' | 'ADMIN'
    }
}
