import { useLocalSearchParams } from "expo-router";

import ContentDetailScreen from "@/features/content/detail/ContentDetailScreen";

export default function ContentDetailRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return <ContentDetailScreen id={id ?? ""} />;
}
