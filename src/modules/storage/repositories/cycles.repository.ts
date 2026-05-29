import { Cycle } from "../../../types/cycle.types";

import db from "../core/database";

/** Inserta ciclo nuevo en historial local. */
export async function addCycle(cycle: Cycle) {
    await db().runAsync(
        "INSERT INTO cycles (startDate, endDate, predicted, source, createdAt) VALUES (?, ?, ?, ?, ?)",
        cycle.startDate,
        cycle.endDate ?? null,
        cycle.predicted ? 1 : 0,
        cycle.source ?? (cycle.predicted ? "estimated" : "observed"),
        cycle.createdAt,
    );
}

/** Fuerza ciclo observado al detectar inicio real de periodo. */
export async function upsertObservedCycleStart(startDate: string, createdAt: string) {
    const existing = await db().getFirstAsync<{ id: number }>(
        "SELECT id FROM cycles WHERE startDate = ? ORDER BY id DESC LIMIT 1",
        startDate,
    );

    if (existing) {
        await db().runAsync("UPDATE cycles SET predicted = 0, source = 'observed' WHERE id = ?", existing.id);
        return;
    }

    await addCycle({
        startDate,
        endDate: null,
        predicted: false,
        source: "observed",
        createdAt,
    });
}

/** Cierra último ciclo observado cuando se registra fin real. */
export async function closeLatestObservedCycle(endDate: string) {
    const existing = await db().getFirstAsync<{ id: number; endDate: string | null }>(
        "SELECT id, endDate FROM cycles WHERE startDate <= ? ORDER BY startDate DESC, id DESC LIMIT 1",
        endDate,
    );

    if (!existing) {
        return;
    }

    if (existing.endDate && existing.endDate >= endDate) {
        return;
    }

    await db().runAsync(
        "UPDATE cycles SET endDate = ?, predicted = 0, source = 'observed' WHERE id = ?",
        endDate,
        existing.id,
    );
}

/** Carga ciclos ordenados para estimación y pantallas. */
export async function loadCycles(): Promise<Cycle[]> {
    const rows = await db().getAllAsync<{
        id: number;
        startDate: string;
        endDate: string | null;
        predicted: number;
        source: Cycle["source"];
        createdAt: string;
    }>("SELECT * FROM cycles ORDER BY startDate DESC");

    return rows.map((row) => ({
        id: row.id,
        startDate: row.startDate,
        endDate: row.endDate,
        predicted: row.predicted === 1,
        source: row.source ?? (row.predicted === 1 ? "estimated" : "observed"),
        createdAt: row.createdAt,
    }));
}
