import { Container } from '@/components/shared/container'

export default function AppLoading() {
    return (
        <Container className="py-10">
            <p className="text-muted-foreground text-sm">Загрузка данных...</p>
        </Container>
    )
}
