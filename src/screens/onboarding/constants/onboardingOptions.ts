import { translate } from "@/modules/localization/i18n";
import { Regularity } from "@/types/settings.types";

export const TRYING_TO_CONCEIVE_OPTION = {
    label: translate("onboarding:goal.label"),
    description: translate("onboarding:goal.description"),
    icon: "sprout-outline",
};

export const REGULARITY: { key: Regularity; label: string }[] = [
    { key: "regular", label: translate("onboarding:regularity.regular") },
    { key: "variable", label: translate("onboarding:regularity.variable") },
    { key: "irregular", label: translate("onboarding:regularity.irregular") },
];
