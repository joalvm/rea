import { useLocalSearchParams } from "expo-router";

import ContentDetail from "@/features/content/detail/ContentDetail";

export default function ContentDetailRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return <ContentDetail id={id ?? ""} />;
}
