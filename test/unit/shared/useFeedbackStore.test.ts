import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import { useFeedbackStore } from "@/shared/feedback/useFeedbackStore";

function reset() {
    useFeedbackStore.setState({
        message: null,
        action: null,
        visible: false,
        durationMs: 5000,
        showCount: 0,
    });
}

beforeEach(() => {
    reset();
});
afterEach(() => {
    reset();
});

describe("useFeedbackStore", () => {
    it("show() hace visible el snackbar con el mensaje", () => {
        useFeedbackStore.getState().show({ message: "Hola" });

        const state = useFeedbackStore.getState();
        expect(state.visible).toBe(true);
        expect(state.message).toBe("Hola");
        expect(state.action).toBeNull();
        expect(state.durationMs).toBe(5000);
    });

    it("show() con action guarda la acción", () => {
        const action = { label: "Deshacer", onPress: () => {} };
        useFeedbackStore.getState().show({ message: "Borrado", action });

        expect(useFeedbackStore.getState().action).toEqual(action);
    });

    it("show() respeta durationMs personalizado", () => {
        useFeedbackStore.getState().show({ message: "x", durationMs: 8000 });
        expect(useFeedbackStore.getState().durationMs).toBe(8000);
    });

    it("show() reemplaza el snackbar anterior e incrementa showCount", () => {
        useFeedbackStore.getState().show({ message: "uno" });
        const count1 = useFeedbackStore.getState().showCount;

        useFeedbackStore.getState().show({ message: "dos" });
        const state2 = useFeedbackStore.getState();

        expect(state2.message).toBe("dos");
        expect(state2.showCount).toBe(count1 + 1);
    });

    it("dismiss() oculta el snackbar sin limpiar el mensaje (lo limpia el componente)", () => {
        useFeedbackStore.getState().show({ message: "Hola" });
        useFeedbackStore.getState().dismiss();

        const state = useFeedbackStore.getState();
        expect(state.visible).toBe(false);
    });
});
