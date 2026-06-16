import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onContinue: () => void;
};

/** Onboarding: anticoncepción hormonal (hormonal_contraception). Condiciona fertilidad/TTC. Ver README. */
export default function Contraception({ onContinue }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="¿Usas anticoncepción hormonal?"
            routePath="(onboarding)/contraception.tsx"
            description="Si la usas, Rea registra síntomas y sangrados pero no mostrará estimaciones fértiles como naturales."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
