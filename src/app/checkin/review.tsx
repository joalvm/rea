import { useRouter } from "expo-router";

import ReviewScreen from "@/features/checkin/review/ReviewScreen";

export default function ReviewRoute() {
    const router = useRouter();

    // Scaffold: al guardar vuelve a la app. La impl real debe persistir el
    // check-in, recalcular daily_summary y cerrar el wizard hacia su origen.
    return <ReviewScreen onSave={() => router.replace("/(tabs)")} />;
}
