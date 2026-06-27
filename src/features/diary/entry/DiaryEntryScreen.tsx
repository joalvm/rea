import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    date: string;
    onStartCheckin: () => void;
};

/** Detalle de día (diary/[date]): lectura del día + acceso a registrar. Ver README. */
export default function DiaryEntryScreen({ date, onStartCheckin }: Props) {
    return (
        <Placeholder
            phase="MVP"
            title="Registro del día"
            routePath="diary/[date].tsx"
            description={`Detalle del ${date}: fase estimada del día, check-ins, síntomas, medicación, relaciones y consejo. Desde aquí se edita o se añade un registro.`}
            primaryLabel="Hacer check-in"
            onPrimary={onStartCheckin}
        />
    );
}
