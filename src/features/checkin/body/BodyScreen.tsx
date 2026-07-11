import { Thermometer } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { SectionTitle } from "@/features/checkin/shared/components/checkin-screen/SectionTitle";
import { useBodyStyles } from "./BodyStyle";

type Props = {
    onContinue: () => void;
};

/**
 * Check-in paso 3: cuerpo (BBT, moco, cervical, libido, peso, náuseas…).
 * Stub navegable — el contenido por modo se construye en Fase 3.
 */
export default function BodyScreen({ onContinue }: Props) {
    const { t } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    useBodyStyles();

    return (
        <CheckinScreen cta={{ label: tCommon("action.continue"), onPress: onContinue }}>
            <CheckinHeader Icon={Thermometer} title={t("steps.body")} lead={t("body.pain.title")} />

            <SectionTitle hint={t("body.bbt.hint")}>{t("body.bbt.title")}</SectionTitle>
        </CheckinScreen>
    );
}
