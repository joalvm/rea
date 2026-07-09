# Stores (Zustand)

## Anatomía

```ts
// SessionStore.ts
import { create } from 'zustand';

type SessionState = {
  userId: string | null;
  isOnboarded: boolean;
  setUser: (id: string) => void;
  reset: () => void;
};

export const useSessionStore = create<SessionState>()((set) => ({
  userId: null,
  isOnboarded: false,
  setUser: (id) => set({ userId: id }),
  reset: () => set({ userId: null, isOnboarded: false }),
}));
```

## Con persistencia (MMKV)

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/store/mmkvStorage'; // adaptador MMKV (ver estructura)

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'prefs', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
```

## Slices (stores grandes)

```ts
import { create, type StateCreator } from 'zustand';

type AuthSlice = { userId: string | null; signIn: (id: string) => void };
type UiSlice = { sidebarOpen: boolean; toggleSidebar: () => void };
type AppState = AuthSlice & UiSlice;

const authSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  userId: null,
  signIn: (id) => set({ userId: id }),
});

const uiSlice: StateCreator<AppState, [], [], UiSlice> = (set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
});

export const useAppStore = create<AppState>()((...a) => ({
  ...authSlice(...a),
  ...uiSlice(...a),
}));
```

## Reglas

- Forma currificada `create<State>()(...)` para que TypeScript infiera bien.
- Estado y actions juntos; las actions actualizan vía `set` de forma inmutable (spread, nunca mutación).
- Actions async retornan `Promise<void>`.
- Persistencia: `persist` con adaptador **MMKV**, no AsyncStorage.
- Store grande → un slice por dominio, combinados con `StateCreator`.
- El store no cachea datos de la base de datos (ver estructura): solo estado efímero/flujo. Lecturas reactivas = read-hooks (`../react/hooks.md`).
- Consumo y selectores → `selectors.md`.
