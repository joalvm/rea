import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

import { useContentSources } from "@/domain/hooks/useContentSources";
import { formatDate } from "@/modules/l10n/formatDate";
import { useSourcesStyles } from "./SourcesStyle";

/** Fuentes editoriales locales con fecha de revisión y referencia visible. */
export default function SourcesScreen() {
    const { t } = useTranslation("settings");
    const styles = useSourcesStyles();
    const { sources } = useContentSources();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("sourcesTitle")}</Text>
            <Text style={styles.description}>{t("sourcesDescription")}</Text>
            <View style={styles.links}>
                {sources.length === 0 ? <Text style={styles.description}>{t("noSources")}</Text> : null}
                {sources.map((source) => (
                    <View key={source.id} style={styles.linkRow}>
                        <Text style={styles.linkLabel}>{t(source.labelKey as never)}</Text>
                        {source.referenceKey ? (
                            <Text style={styles.linkHint}>{t(source.referenceKey as never)}</Text>
                        ) : null}
                        {source.reviewedAt ? (
                            <Text style={styles.linkHint}>
                                {t("reviewed", { date: formatDate(source.reviewedAt, "long") })}
                            </Text>
                        ) : null}
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}
