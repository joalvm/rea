import type { LucideIcon } from "lucide-react-native";
import type { ColorValue } from "react-native";

type Props = {
    Icon: LucideIcon;
    color: ColorValue;
    focused: boolean;
};

/**
 * Icono de pestaña. El estado activo se refuerza con un trazo más grueso y un
 * tamaño ligeramente mayor (los colores activo/inactivo los inyecta el tema en
 * `(tabs)/_layout.tsx`).
 */
export function TabIcon({ Icon, color, focused }: Props) {
    return <Icon size={focused ? 23 : 21} color={color} strokeWidth={focused ? 2.4 : 1.8} />;
}
