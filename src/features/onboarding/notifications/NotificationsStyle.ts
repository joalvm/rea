import { createStyles } from "@/theme/createStyles";

export const useNotificationsStyles = createStyles(() => ({
    header: {
        gap: 4,
    },
    fieldGroup: {
        gap: 6,
    },
    timeRow: {
        flexDirection: "row",
        gap: 8,
    },
    timeColumn: {
        flex: 1,
    },
}));
