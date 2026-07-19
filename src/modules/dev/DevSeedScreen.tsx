import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

import { createDatabase } from "@/db/client";
import { seedDemoData } from "@/modules/dev/seedDemoData";
import { useTheme } from "@/theme/useTheme";

/**
 * Pantalla de desarrollo (solo `__DEV__`) accesible vía la ruta oculta
 * `/dev/seed`. Al abrirla, restablece la base de datos y siembra datos de demo
 * para verificación visual con Maestro. Muestra estado y al terminar reinicia
 * la navegación hacia la home.
 */
export default function DevSeedScreen() {
    if (!__DEV__) {
        return <DisabledInProduction />;
    }
    return <DevSeedRunner />;
}

function DisabledInProduction() {
    const theme = useTheme();
    return (
        <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
            <Text style={{ color: theme.colors.text }}>Sembrado de demo deshabilitado en producción.</Text>
        </View>
    );
}

function DevSeedRunner() {
    const theme = useTheme();
    const router = useRouter();
    const raw = useSQLiteContext();
    const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const run = async () => {
        setStatus("running");
        setError(null);
        try {
            const database = createDatabase(raw);
            await seedDemoData(raw, database);
            setStatus("done");
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setStatus("error");
        }
    };

    // Auto-ejecuta al montar para que el deep link `rea://dev/seed` siembre y
    // redirija sin intervención táctil (ideal para Maestro).
    useEffect(() => {
        const timer = setTimeout(() => {
            void run();
        }, 0);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (status !== "done") return;
        const t = setTimeout(() => router.replace("/(tabs)"), 400);
        return () => clearTimeout(t);
    }, [status, router]);

    return (
        <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
            {status === "running" && (
                <>
                    <ActivityIndicator color={theme.colors.primary} />
                    <Text style={[styles.text, { color: theme.colors.textMuted }]}>Sembrando datos de demo…</Text>
                </>
            )}
            {status === "done" && <Text style={[styles.text, { color: theme.colors.text }]}>Sembrado completo.</Text>}
            {status === "error" && (
                <View style={styles.errorBox}>
                    <Text style={[styles.text, { color: theme.colors.dangerText }]}>Error al sembrar:</Text>
                    <Text style={[styles.text, { color: theme.colors.dangerText }]}>{error}</Text>
                    <Pressable onPress={run} style={[styles.retry, { borderColor: theme.colors.border }]}>
                        <Text style={{ color: theme.colors.primary }}>Reintentar</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 12,
    },
    text: {
        fontSize: 15,
        textAlign: "center",
    },
    errorBox: {
        gap: 8,
        alignItems: "center",
    },
    retry: {
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderRadius: 8,
    },
});
