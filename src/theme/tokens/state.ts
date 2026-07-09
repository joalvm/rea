import type { State } from "../types/state";

/**
 * Tokens de interacción (tokens crudos). Opacidades y escala compartidas por los
 * componentes para estados disabled/pressed, así el feedback táctil es uniforme
 * en toda la app. Ver docs/design/components.html#principios-componentes → Tokens de componente.
 */
export const state: State = {
    disabledOpacity: 0.45,
    pressedOpacity: 0.9,
    pressedScale: 0.97,
};
