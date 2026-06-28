export type YMD = {
    day: number;
    /** 1..12. */
    month: number;
    year: number;
};

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

export function ymdToISO(parts: YMD): string {
    return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function isoToYMD(iso: string | null): YMD {
    if (!iso) {
        return todayYMD();
    }
    const [year, month, day] = iso.split("-").map((value) => Number(value));
    return { year: year ?? 1970, month: month ?? 1, day: day ?? 1 };
}

export function todayYMD(): YMD {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}

export function compareYmd(left: YMD, right: YMD): number {
    return ymdToISO(left).localeCompare(ymdToISO(right));
}

/** Lista de horas "HH:00" entre `from` y `to` inclusive. */
export function hourLabels(from: number, to: number): string[] {
    const items: string[] = [];
    for (let hour = from; hour <= to; hour += 1) {
        items.push(`${pad(hour)}:00`);
    }
    return items;
}
