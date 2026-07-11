import { Heart } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { useFertilityStyles } from "./FertilityStyle";

type Props = {
    onContinue: () => void;
};

/**
 * Check-in paso 5: fertilidad y tests (OPK, test de embarazo, relaciones).
 * Stub navegable — el contenido por modo se construye en Fase 3.
 */
export default function FertilityScreen({ onContinue }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    useFertilityStyles();

    return (
        <CheckinScreen cta={{ label: tCommon("action.continue"), onPress: onContinue }}>
            <CheckinHeader Icon={Heart} title={t("fertility.title")} lead={t("fertility.pregnancyTest.hint")} />

            <SectionTitle>{t("fertility.pregnancyTest.title")}</SectionTitle>
        </CheckinScreen>
    );
}
