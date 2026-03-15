'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/shared/container'

type AppErrorProps = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function AppError({ error, reset }: AppErrorProps) {
    useEffect(() => {
        console.error('App segment error:', error)
    }, [error])

    return (
        <Container className="py-10">
            <section className="space-y-3 rounded-md border p-6">
                <h1 className="text-xl font-semibold">Не удалось загрузить страницу</h1>
                <p className="text-muted-foreground text-sm">
                    Попробуйте обновить страницу. Если ошибка повторяется, проверьте серверные логи.
                </p>
                <Button onClick={() => reset()}>Повторить</Button>
            </section>
        </Container>
    )
}
