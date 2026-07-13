import type { TFunction } from "i18next";

export type LabelResolver = TFunction;

/**
 * Traduce un `labelKey` del catálogo (formato `namespace:resto`) a texto visible
 * usando el `t` de i18next. Si la clave no trae namespace, la devuelve tal cual.
 *
 * Extraído de `SymptomsScreen` para reutilizarlo en el intro (quick-options) y
 * cualquier consumidor del catálogo que necesite resolver etiquetas.
 */
export function resolveLabel(labelKey: string, t: LabelResolver): string {
    const [ns, ...rest] = labelKey.split(":");
    if (!ns || rest.length === 0) {
        return labelKey;
    }
    return String(t(rest.join(":"), { ns } as never));
}
