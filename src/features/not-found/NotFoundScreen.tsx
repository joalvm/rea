import { Link, Stack } from "expo-router";
import { useNotFoundStyles } from "./NotFoundStyle";
import { Text, View } from "react-native";

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
