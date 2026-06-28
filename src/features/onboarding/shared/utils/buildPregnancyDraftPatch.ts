import type { OnboardingDraft } from "../types/OnboardingDraft";
import { compareYmd, type YMD, ymdToISO } from "./onboardingDate";

type PregnancyDraftPatch = Pick<OnboardingDraft, "pregnancyDueDate" | "pregnancyLmp">;

type PregnancyDraftPatchResult =
    | {
          isValid: true;
          patch: PregnancyDraftPatch;
      }
    | {
          isValid: false;
      };

export function buildPregnancyDraftPatch(lmp: YMD, due: YMD, knowDue: boolean): PregnancyDraftPatchResult {
    if (knowDue && compareYmd(due, lmp) <= 0) {
        return { isValid: false };
    }

    return {
        isValid: true,
        patch: {
            pregnancyLmp: ymdToISO(lmp),
            pregnancyDueDate: knowDue ? ymdToISO(due) : null,
        },
    };
}
