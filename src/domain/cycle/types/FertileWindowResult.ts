/**
 * Razón por la que `fertileWindow` suprime la ventana en vez de calcularla.
 * `hormonal_contraception` y `breastfeeding` son supresiones honestas ("tu método/
 * lactancia suprime la ovulación/ventana"); `no_ovulation` es defensiva — no hay
 * fecha de ovulación de la que partir (no debería ocurrir con `estimateOvulation`
 * en el flujo normal, ya que su nivel de calendario siempre resuelve).
 */
export type FertileWindowSuppressionReason = "hormonal_contraception" | "breastfeeding" | "no_ovulation";

/**
 * Resultado de `fertileWindow`. Cuando `suppressed` es `true` la UI nunca debe
 * presentar la ventana como "segura/no segura", solo mostrar la razón.
 */
export type FertileWindowResult =
    | { start: string; end: string; suppressed: false; suppressedReason: null }
    | { start: null; end: null; suppressed: true; suppressedReason: FertileWindowSuppressionReason };
