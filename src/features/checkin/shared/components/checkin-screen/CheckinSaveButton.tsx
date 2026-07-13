import { Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { PrimaryButton } from "@/components/primary-button/PrimaryButton";

import { useCompleteCheckin } from "@/features/checkin/shared/hooks/useCompleteCheckin";

type Props = {
    /** Se invoca tras un guardado exitoso (o cuando no hay nada que guardar). */
    onSaved: () => void;
    /** Deshabilita el botón (ej. durante otra operación en curso). */
    disabled?: boolean;
    /**
     * Si es `true`, el botón permanece habilitado aunque el draft esté vacío
     * (día "nada que reportar" = salida explícita en 1 tap). Por defecto
     * `false`: en los pasos intermedios no tiene sentido guardar sin contenido.
     */
    allowEmpty?: boolean;
};

/**
 * Botón "Guardar" reutilizable para cualquier paso del wizard de check-in
 * (Fase 4: guardar accesible desde cualquier paso). Envuelve `useCompleteCheckin`
 * y, al guardar con éxito (o cuando el draft está vacío — día "nada que
 * reportar" = no-op), llama `onSaved` para que la pantalla navegue a home.
 *
 * Se coloca dentro del `<View style={screenStyles.footer}>` de cada paso,
 * debajo del botón "Continuar".
 */
export function CheckinSaveButton({ onSaved, disabled, allowEmpty = false }: Props) {
    const { t } = useTranslation("checkIn");
    const { submit, isSubmitting, isEmpty } = useCompleteCheckin();

    const handleSave = async () => {
        const ok = await submit();
        if (ok) {
            onSaved();
        }
    };

    return (
        <PrimaryButton
            label={t("intro.saveNow")}
            onPress={handleSave}
            disabled={disabled || isSubmitting || (isEmpty && !allowEmpty)}
            variant="secondary"
            Icon={Check}
        />
    );
}
