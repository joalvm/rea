import { create } from "zustand";

/** Acción opcional del snackbar (ej. "Deshacer"). */
export type FeedbackAction = {
    label: string;
    onPress: () => void;
};

type ShowParams = {
    message: string;
    action?: FeedbackAction;
    /** Tiempo hasta auto-cierre. Default 5000 ms. */
    durationMs?: number;
};

type FeedbackState = {
    message: string | null;
    action: FeedbackAction | null;
    visible: boolean;
    /** Duración del auto-cierre actual (ms). El componente lo lee para su timer. */
    durationMs: number;
    /** Incrementa en cada `show`: permite al componente reiniciar el timer. */
    showCount: number;
    /** Muestra un snackbar. Reemplaza cualquier snackbar previo y reinicia el timer. */
    show: (params: ShowParams) => void;
    /** Oculta el snackbar inmediatamente. */
    dismiss: () => void;
};

const DEFAULT_DURATION_MS = 5000;

/**
 * Store efímero para feedback global (snackbar). Zustand sin persistencia: el
 * estado vive solo en memoria y se pierde al recargar. Soporta un único
 * snackbar a la vez; `show` reemplaza el anterior. El timer de auto-cierre se
 * gestiona en el componente (`Snackbar`) para respetar el ciclo de vida de
 * React y limpiar el `setTimeout` al desmontar.
 */
export const useFeedbackStore = create<FeedbackState>((set) => ({
    message: null,
    action: null,
    visible: false,
    durationMs: DEFAULT_DURATION_MS,
    showCount: 0,
    show: ({ message, action, durationMs }) =>
        set((state) => ({
            message,
            action: action ?? null,
            visible: true,
            durationMs: durationMs ?? DEFAULT_DURATION_MS,
            showCount: state.showCount + 1,
        })),
    dismiss: () => set({ visible: false }),
}));
