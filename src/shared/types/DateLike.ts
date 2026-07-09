/**
 * Entradas que la app acepta como fecha: un `Date`, un ISO/`YYYY-MM-DD`, o un
 * timestamp en milisegundos. Contrato compartido por los formateadores de l10n.
 */
export type DateLike = Date | string | number;
