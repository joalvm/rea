import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

import { useContentItem } from "@/domain/hooks/useContentItem";
import { formatDate } from "@/modules/l10n/formatDate";
import { useContentDetailStyles } from "./ContentDetailStyle";

type Props = {
    id: string;
};

/** Detalle editorial: copy localizado, fuente visible y disclaimer de no diagnóstico. */
export default function ContentDetailScreen({ id }: Props) {
    const { t } = useTranslation("content");
    const styles = useContentDetailStyles();
    const { content } = useContentItem(id);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            {content ? (
                <>
                    <Text style={styles.title}>{t(content.item.titleKey as never)}</Text>
                    <Text style={styles.description}>{t(content.item.bodyKey as never)}</Text>
                    <View style={styles.linkRow}>
                        <Text style={styles.linkLabel}>{t("source")}</Text>
                        <Text style={styles.linkHint}>
                            {content.source ? t(content.source.labelKey as never) : t("detailNotFound")}
                        </Text>
                        {content.source?.reviewedAt ? (
                            <Text style={styles.linkHint}>
                                {t("reviewed", { date: formatDate(content.source.reviewedAt, "long") })}
                            </Text>
                        ) : null}
                    </View>
                    <Text style={styles.description}>{t("disclaimer")}</Text>
                </>
            ) : (
                <Text style={styles.description}>{t("detailNotFound")}</Text>
            )}
        </ScrollView>
    );
}
