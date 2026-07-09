/**
 * Pone en mayúscula la primera letra respetando el resto. Útil porque `Intl`
 * devuelve meses y días en minúscula en español ("lunes", "junio") y la UI suele
 * quererlos capitalizados al inicio de una etiqueta.
 *
 * Usa el iterador de `String` para no partir grafemas/emoji compuestos.
 */
export function capitalizeFirst(value: string): string {
    if (value.length === 0) {
        return value;
    }
    const [first, ...rest] = [...value];
    return (first ?? "").toLocaleUpperCase() + rest.join("");
}
