import Placeholder from "@/components/placeholder/Placeholder";

type Props = {
    id: string;
};

/** Detalle de una pieza de contenido + su fuente (content_items + content_sources). Ver README. */
export default function ContentDetailScreen({ id }: Props) {
    return (
        <Placeholder
            phase="P2"
            title="Contenido"
            routePath="content/[id].tsx"
            description={`Título, cuerpo, fuente revisada y fecha de revisión del contenido "${id}". Siempre con la nota "no es diagnóstico".`}
        />
    );
}
