import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { ContentItem } from "@/db/schema/contentItem";

import { useHomeStyles } from "../HomeStyle";

type Props = {
    item: ContentItem;
    onPress: () => void;
};

/** Una única pieza editorial contextual en Hoy; el catálogo completo vive en Aprender. */
export function HomeContentCard({ item, onPress }: Props) {
    const { t } = useTranslation("content");
    const styles = useHomeStyles();

    return (
        <View style={styles.contentCard}>
            <Text style={styles.contentEyebrow}>{t("title")}</Text>
            <Text style={styles.cardTitle}>{t(item.titleKey as never)}</Text>
            <Text style={styles.cardText} numberOfLines={3}>
                {t(item.bodyKey as never)}
            </Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("open")}
                onPress={onPress}
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            >
                <Text style={styles.secondaryBtnText}>{t("open")}</Text>
            </Pressable>
        </View>
    );
}
