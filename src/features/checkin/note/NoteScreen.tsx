import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 7: nota libre (checkins.note). Ver README. */
export default function NoteScreen({ onContinue }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Una nota para hoy"
            routePath="checkin/note.tsx"
            description="Algo que quieras recordar de este momento. Opcional y en tono de diario."
            primaryLabel="Continuar"
            onPrimary={onContinue}
        />
    );
}
