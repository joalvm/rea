import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useContentCatalog } from "@/domain/hooks/useContentCatalog";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useActiveIntent } from "@/domain/hooks/useActiveIntent";
import { selectContentCandidates } from "@/domain/content/selectContentCandidates";
import { usePregnancyEpisode } from "@/domain/hooks/usePregnancyEpisode";
import { computePregnancyProgress } from "@/domain/pregnancy/computePregnancyProgress";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";
import { useTipsStyles } from "./TipsStyle";

/** Biblioteca editorial local; filtra el corpus mínimo por el contexto reproductivo actual. */
export default function TipsScreen() {
    const { t, i18n } = useTranslation("content");
    const router = useRouter();
    const styles = useTipsStyles();
    const { profile } = useLocalProfile();
    const { intent } = useActiveIntent(profile?.id ?? "");
    const { episode } = usePregnancyEpisode(profile?.id ?? "");
    const locale = i18n.language.startsWith("en") ? "en" : "es";
    const { items, rules } = useContentCatalog(locale);
    const pregnancyWeek = episode ? computePregnancyProgress(episode.lmpDate, ymdToISO(todayYMD())).week : null;
    const visibleItems = selectContentCandidates(items, rules, {
        pregnancyWeek,
        reproductiveMode: intent?.reproductiveMode,
    });

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("title")}</Text>
            <Text style={styles.description}>{t("description")}</Text>
            <View style={styles.links}>
                {visibleItems.length === 0 ? <Text style={styles.description}>{t("empty")}</Text> : null}
                {visibleItems.map((item) => (
                    <Pressable
                        key={item.id}
                        accessibilityRole="button"
                        onPress={() => router.push(`/content/${item.id}`)}
                        style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
                    >
                        <Text style={styles.linkLabel}>{t(item.titleKey as never)}</Text>
                        <Text style={styles.linkHint}>{t(item.bodyKey as never)}</Text>
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );
}
