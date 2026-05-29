import { StyleSheet } from "react-native";

import { colors } from "../theme";

const styles = StyleSheet.create({
    app: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scene: {
        flex: 1,
    },
    loading: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default styles;
