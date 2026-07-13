import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { useDatabase } from "@/db/useDatabase";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { getCheckinById } from "@/features/checkin/shared/services/getCheckinById";
import { useCheckinStore } from "@/features/checkin/shared/stores/useCheckinStore";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";

/**
 * Ruta puente invisible: carga el registro por id, hidrata el draft del wizard
 * en modo edición y redirige al primer paso (`bleeding`), saltando el intro.
 *
 * Today-guard defensivo: si el registro no es de hoy, redirige al intro del
 * wizard (la edición de días pasados no está permitida; el UI ya oculta el
 * botón, pero esto protege contra navegación manual / deep links).
 */
export default function CheckinEditRoute() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const hydrateForEdit = useCheckinStore((state) => state.hydrateForEdit);
    const ranRef = useRef(false);
    const [status, setStatus] = useState<"loading" | "ready">("loading");

    const checkinId = Array.isArray(id) ? id[0] : id;

    useEffect(() => {
        if (ranRef.current) return;
        if (!profile || !checkinId) return;

        ranRef.current = true;
        const todayISO = ymdToISO(todayYMD());

        (async () => {
            const record = await getCheckinById(database, { profileId: profile.id, checkinId });

            if (!record) {
                // No encontrado o borrado: al intro.
                router.replace("/checkin");
                return;
            }

            if (record.localDate !== todayISO) {
                // Defensivo: no se editan registros pasados.
                router.replace("/checkin");
                return;
            }

            hydrateForEdit({ id: record.id, localDate: record.localDate, snapshot: record.snapshot });
            router.replace("/checkin/bleeding");
        })().catch(() => {
            setStatus("ready");
            router.replace("/checkin");
        });
    }, [database, profile, checkinId, hydrateForEdit, router]);

    return <View style={{ flex: 1 }} />;
}
