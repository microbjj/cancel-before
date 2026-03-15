import { Container } from "@/components/shared/container";

export function Footer() {
  return (
    <footer className="border-t">
      <Container className="py-6 text-center text-xs text-muted-foreground">
        Сделано, чтобы не пропускать дедлайны отмены подписок.
      </Container>
    </footer>
  );
}
