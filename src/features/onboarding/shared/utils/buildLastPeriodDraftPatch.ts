import type { OnboardingDraft } from "../types/OnboardingDraft";
import { compareYmd, type YMD, ymdToISO } from "./onboardingDate";

type LastPeriodDraftPatch = Pick<OnboardingDraft, "lastPeriodEnd" | "lastPeriodStart">;

type LastPeriodDraftPatchResult =
    | {
          isValid: true;
          patch: LastPeriodDraftPatch;
      }
    | {
          isValid: false;
      };

export function buildLastPeriodDraftPatch(
    start: YMD,
    end: YMD,
    lastPeriodOngoing: boolean,
): LastPeriodDraftPatchResult {
    if (!lastPeriodOngoing && compareYmd(end, start) < 0) {
        return { isValid: false };
    }

    return {
        isValid: true,
        patch: {
            lastPeriodStart: ymdToISO(start),
            lastPeriodEnd: lastPeriodOngoing ? null : ymdToISO(end),
        },
    };
}
