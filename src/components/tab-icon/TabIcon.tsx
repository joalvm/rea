import { LucideIcon } from "lucide-react-native";
import { ColorValue } from "react-native";

interface TabIconProps {
    Icon: LucideIcon;
    color: ColorValue;
    focused: boolean;
}

export default function TabIcon({ Icon, color, focused }: TabIconProps) {
    if (focused) {
        return <Icon size={20} color={color} strokeWidth={1.5} />;
    }

    return <Icon size={20} color={color} strokeWidth={1.5} />;
}
