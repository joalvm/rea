import type { RegularitySelection } from "../types/OnboardingDraft";

type RegularitySelectionSource = {
    regularity: Exclude<RegularitySelection, "unsure">;
    regularitySelection: RegularitySelection | null;
};

export function getRegularitySelection({
    regularity,
    regularitySelection,
}: RegularitySelectionSource): RegularitySelection {
    return regularitySelection ?? regularity;
}
