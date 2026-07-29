import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

import { useMedicationCatalog } from "@/domain/hooks/useMedicationCatalog";
import { useMedicationsManagerStyles } from "./MedicationsManagerStyle";

/** Catálogo personal de medicamentos activos, incluyendo la declaración de seguridad en embarazo. */
export default function MedicationsManagerScreen() {
    const { t } = useTranslation("settings");
    const styles = useMedicationsManagerStyles();
    const { medications } = useMedicationCatalog();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("medicationsTitle")}</Text>
            <Text style={styles.description}>{t("medicationsDescription")}</Text>
            <View style={styles.links}>
                {medications.length === 0 ? <Text style={styles.description}>{t("noMedications")}</Text> : null}
                {medications.map((medication) => (
                    <View key={medication.id} style={styles.linkRow}>
                        <Text style={styles.linkLabel}>{medication.name}</Text>
                        <Text style={styles.linkHint}>
                            {t("pregnancySafety", { value: medication.isPregnancySafe ? t("yes") : t("no") })}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}
