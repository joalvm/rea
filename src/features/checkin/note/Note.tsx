import ScreenPlaceholder from "@/components/screen-placeholder/ScreenPlaceholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 7: nota libre (checkins.note). Ver README. */
export default function Note({ onContinue }: Props) {
    return (
        <ScreenPlaceholder
            phase="MVP"
            title="Una nota para hoy"
            routePath="checkin/note.tsx"
            description="Algo que quieras recordar de este momento. Opcional y en tono de diario."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
