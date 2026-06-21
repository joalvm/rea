import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

import { createStyles } from "@/theme/createStyles";

export default function NotFoundScreen() {
    const styles = useNotFoundStyles();

    return (
        <>
            <Stack.Screen options={{ title: "Oops!" }} />
            <View style={styles.container}>
                <Text style={styles.title}>This screen doesn&apos;t exist.</Text>

                <Link href="/" style={styles.link}>
                    <Text style={styles.linkText}>Go to home screen!</Text>
                </Link>
            </View>
        </>
    );
}

const useNotFoundStyles = createStyles((theme) => ({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing["2xl"],
        backgroundColor: theme.colors.background,
    },
    title: {
        ...theme.typography.variant.h3,
        color: theme.colors.text,
    },
    link: {
        marginTop: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
    },
    linkText: {
        ...theme.typography.variant.subhead,
        color: theme.colors.link,
    },
}));
