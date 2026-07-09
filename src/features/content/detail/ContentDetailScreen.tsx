import { ScrollView, Text } from "react-native";

import { useContentDetailStyles } from "./ContentDetailStyle";

type Props = {
    id: string;
};

/** Detalle de una pieza de contenido + su fuente (content_items + content_sources).   */
export default function ContentDetailScreen({ id }: Props) {
    const styles = useContentDetailStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Contenido"}</Text>
            <Text
                style={styles.description}
            >{`Título, cuerpo, fuente revisada y fecha de revisión del contenido "${id}". Siempre con la nota "no es diagnóstico".`}</Text>
        </ScrollView>
    );
}
