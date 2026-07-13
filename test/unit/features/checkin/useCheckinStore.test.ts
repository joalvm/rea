import { beforeEach, describe, expect, it } from "@jest/globals";

import { INITIAL_CHECKIN_DRAFT } from "@/features/checkin/shared/types/CheckinDraft";
import { useCheckinStore } from "@/features/checkin/shared/stores/useCheckinStore";

beforeEach(() => {
    useCheckinStore.getState().reset();
});

describe("useCheckinStore.hydrate", () => {
    it("mezcla el snapshot en el draft manteniendo el localDate de hoy", () => {
        const today = INITIAL_CHECKIN_DRAFT.localDate;

        useCheckinStore.getState().hydrate({ mood: 2, energy: 4 });

        const draft = useCheckinStore.getState().draft;
        expect(draft.mood).toBe(2);
        expect(draft.energy).toBe(4);
        expect(draft.localDate).toBe(today);
        expect(draft.activeStep).toBe(0);
    });

    it("reinicia activeStep a 0 sin importar el estado previo", () => {
        useCheckinStore.getState().set({ activeStep: 5 });

        useCheckinStore.getState().hydrate({ mood: 3 });

        expect(useCheckinStore.getState().draft.activeStep).toBe(0);
    });

    it("no pisa campos no incluidos en el snapshot con valores previos", () => {
        useCheckinStore.getState().set({ bleedingIntensity: 2 });

        useCheckinStore.getState().hydrate({ mood: 4 });

        const draft = useCheckinStore.getState().draft;
        // hydrate parte de INITIAL_CHECKIN_DRAFT: bleeding previo se pierde.
        expect(draft.bleedingIntensity).toBeNull();
        expect(draft.mood).toBe(4);
    });
});

describe("useCheckinStore.reset", () => {
    it("limpia el draft al estado inicial", () => {
        useCheckinStore.getState().set({ mood: 5, note: "algo" });
        useCheckinStore.getState().toggleSymptom("cramps");

        useCheckinStore.getState().reset();

        const draft = useCheckinStore.getState().draft;
        expect(draft).toEqual(INITIAL_CHECKIN_DRAFT);
        expect(draft.mood).toBeNull();
        expect(draft.symptoms).toHaveLength(0);
        expect(draft.note).toBeNull();
    });
});

describe("useCheckinStore.toggleSymptom", () => {
    it("añade con intensidad por defecto 2 y quita en toggle", () => {
        useCheckinStore.getState().toggleSymptom("cramps");

        expect(useCheckinStore.getState().draft.symptoms).toEqual([{ symptomKey: "cramps", intensity: 2 }]);

        useCheckinStore.getState().toggleSymptom("cramps");

        expect(useCheckinStore.getState().draft.symptoms).toHaveLength(0);
    });
});
