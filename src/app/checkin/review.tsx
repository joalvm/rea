import { useRouter } from "expo-router";

import Review from "@/features/checkin/review/Review";

export default function ReviewRoute() {
    const router = useRouter();

    // Scaffold: al guardar vuelve a la app. La impl real debe persistir el
    // check-in, recalcular daily_summary y cerrar el wizard hacia su origen.
    return <Review onSave={() => router.replace("/(tabs)")} />;
}
