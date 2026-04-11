import { redirect } from 'next/navigation'

import { ProfileEditForm } from '@/components/profile/edit-form'
import { ProfileSignOutButton } from '@/components/profile/sign-out-button'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'

export default async function ProfilePage() {
    const session = await getAuthSession()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { userPlan: true },
    })

    if (!user) {
        redirect('/login')
    }

    const planLabel = user.userPlan?.tier ?? 'FREE'

    return (
        <div className="mx-auto w-full max-w-sm px-4 py-10 sm:px-6">
            <div className="border-border space-y-6 border p-6">
                <div>
                    <p className="text-grays mb-1 text-xs">Email</p>
                    <p className="text-light text-sm">{session.user.email ?? user.email}</p>
                </div>

                <div>
                    <p className="text-grays mb-1 text-xs">Тариф</p>
                    <p className="text-light text-sm font-medium">{planLabel}</p>
                </div>

                <div className="border-border border-t pt-6">
                    <p className="text-light mb-4 text-sm font-medium">Редактировать профиль</p>
                    <ProfileEditForm initialName={user.name} />
                </div>

                <div className="border-border border-t pt-2">
                    <ProfileSignOutButton />
                </div>
            </div>
        </div>
    )
}
