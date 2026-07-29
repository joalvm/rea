type FertilityCheckin = {
    basalBodyTempC: number | null;
    cervicalMucus: number | null;
    opkResult: "negative" | "positive" | "invalid" | null;
};

export type FertilitySignals = {
    basalTemperatureEntries: number;
    fertileMucusEntries: number;
    positiveOpkEntries: number;
};

/** Resume señales observadas de fertilidad sin convertirlas en probabilidad de embarazo. */
export function computeFertilitySignals(checkins: FertilityCheckin[]): FertilitySignals {
    return {
        basalTemperatureEntries: checkins.filter((checkin) => checkin.basalBodyTempC !== null).length,
        fertileMucusEntries: checkins.filter((checkin) => checkin.cervicalMucus !== null && checkin.cervicalMucus >= 3)
            .length,
        positiveOpkEntries: checkins.filter((checkin) => checkin.opkResult === "positive").length,
    };
}
