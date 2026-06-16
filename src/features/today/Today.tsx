import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onStartCheckin: () => void;
    onOpenDiary: () => void;
};

/** Tab Inicio (Home). Hero de fase + predicción + CTA de check-in. Ver README de la feature. */
export default function Today({ onStartCheckin, onOpenDiary }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Inicio"
            routePath="(tabs)/index.tsx"
            description="Hero con fase estimada y confianza (honestidad), día de ciclo y próxima regla. Tarjeta de predicción, '¿por qué Rea cree esto?', resumen del día y consejo contextual."
            primaryLabel="Hacer check-in"
            onPrimary={onStartCheckin}
            secondaryLabel="Abrir diario de hoy"
            onSecondary={onOpenDiary}
        />
    );
}
