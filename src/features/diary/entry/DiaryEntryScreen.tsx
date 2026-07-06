import { Pressable, ScrollView, Text } from "react-native";

import { useDiaryEntryStyles } from "./DiaryEntryStyle";

type Props = {
    date: string;
    onStartCheckin: () => void;
};

/** Detalle de día (diary/[date]): lectura del día + acceso a registrar.   */
export default function DiaryEntryScreen({ date, onStartCheckin }: Props) {
    const styles = useDiaryEntryStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Registro del día"}</Text>
            <Text
                style={styles.description}
            >{`Detalle del ${date}: fase estimada del día, check-ins, síntomas, medicación, relaciones y consejo. Desde aquí se edita o se añade un registro.`}</Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onStartCheckin}
            >
                <Text style={styles.primaryText}>{"Hacer check-in"}</Text>
            </Pressable>
        </ScrollView>
    );
}
