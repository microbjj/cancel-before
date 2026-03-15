import { Container } from "@/components/shared/container";

export default function MarketingHomePage() {
  return (
    <Container className="py-20">
      <section className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">CancelBefore</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Отменяйте подписки до автоматического списания
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Фиксируйте даты триала, получайте напоминания и контролируйте все подписки в одном месте.
        </p>
      </section>
    </Container>
  );
}
