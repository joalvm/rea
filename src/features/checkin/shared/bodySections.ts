import type { ReproductiveMode } from "@/db/enums/reproductiveMode";

/**
 * Configuración de qué señales de cuerpo/fertilidad mostrar según el modo
 * reproductivo activo. Es la traducción de la tabla de "Pasos por modo" del
 * plan 02 a banderas de UI. Si el modo es desconocido (onboarding no
 * completado), se asume el conjunto neutral de `tracking_only`.
 *
 * Reglas de la tabla del plan:
 * - Cervical solo en TTC.
 * - BBT en todos menos pregnancy (tracking opcional, avoid destacada, ttc con hora).
 * - Náuseas/movimiento solo en pregnancy.
 * - Peso en todos menos avoid.
 * - OPK solo en TTC.
 * - Test de embarazo en todos los modos de ciclo (no pregnancy).
 * - Relaciones en todos los modos.
 */
export type BodySections = {
    mucus: boolean;
    bbt: boolean;
    /** La BBT en TTC pide hora de la toma. */
    bbtTime: boolean;
    cervix: boolean;
    libido: boolean;
    weight: boolean;
    morningSickness: boolean;
    fetalMovement: boolean;
};

export type FertilitySections = {
    opk: boolean;
    pregnancyTest: boolean;
    intercourse: boolean;
};

const DEFAULT_BODY: BodySections = {
    mucus: true,
    bbt: true,
    bbtTime: false,
    cervix: false,
    libido: true,
    weight: true,
    morningSickness: false,
    fetalMovement: false,
};

const DEFAULT_FERTILITY: FertilitySections = {
    opk: false,
    pregnancyTest: true,
    intercourse: true,
};

export function bodySectionsFor(mode: ReproductiveMode | undefined): BodySections {
    switch (mode) {
        case "tracking_avoid_pregnancy":
            return { ...DEFAULT_BODY, cervix: false, weight: false };
        case "tracking_ttc":
            return { ...DEFAULT_BODY, cervix: true, bbtTime: true };
        case "pregnancy_tracking":
            return {
                mucus: false,
                bbt: false,
                bbtTime: false,
                cervix: false,
                libido: true,
                weight: true,
                morningSickness: true,
                fetalMovement: true,
            };
        case "tracking_only":
        default:
            return DEFAULT_BODY;
    }
}

export function fertilitySectionsFor(mode: ReproductiveMode | undefined): FertilitySections {
    switch (mode) {
        case "tracking_ttc":
            return { ...DEFAULT_FERTILITY, opk: true };
        case "pregnancy_tracking":
            // En embarazo el test no aplica; las relaciones son informativas.
            return { opk: false, pregnancyTest: false, intercourse: true };
        case "tracking_avoid_pregnancy":
        case "tracking_only":
        default:
            return DEFAULT_FERTILITY;
    }
}
