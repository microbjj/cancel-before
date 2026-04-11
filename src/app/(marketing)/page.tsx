import { Container } from '@/components/shared/container'

export default function MarketingHomePage() {
    return (
        <Container className="py-12 sm:py-24">
            <section className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-light text-2xl leading-tight font-semibold tracking-tight sm:text-4xl">
                    Отменяйте подписки до автоматического списания
                </h1>
                <p className="text-grays text-base sm:text-lg">
                    Фиксируйте даты триала, получайте напоминания и контролируйте все подписки в
                    одном месте.
                </p>
            </section>
        </Container>
    )
}
