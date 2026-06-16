import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 3: dolor y cuerpo. Ver README. */
export default function Body({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Dolor y cuerpo"
            routePath="checkin/body.tsx"
            description="Dolor (0-5) y si te impidió hacer algo (interferencia 0-3), sensibilidad mamaria (0-5) y PMS (0-5)."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
