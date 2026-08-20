/**
 * Tipi del dominio retributivo.
 *
 * In questo dominio si confondono facilmente quattro grandezze diverse, tutte
 * espresse in euro: la RAL, l'imponibile previdenziale, l'imponibile fiscale
 * (che coincide con il reddito complessivo nel nostro caso semplificato) e il
 * netto. Confonderle produce risultati plausibili e sbagliati.
 *
 * Per questo sono tipi distinti e non semplici `number`: uno scambio diventa un
 * errore di compilazione invece di un numero credibile.
 */

declare const marchio: unique symbol;
type Marcato<T extends string> = number & { readonly [marchio]: T };

/** Retribuzione annua lorda, input dell'utente. */
export type Ral = Marcato<'Ral'>;

/** Base su cui si calcolano i contributi previdenziali. */
export type ImponibilePrevidenziale = Marcato<'ImponibilePrevidenziale'>;

/**
 * Reddito complessivo ai fini IRPEF, ovvero la RAL al netto dei contributi
 * a carico del lavoratore. È la base dell'IRPEF e delle addizionali, ed è
 * anche il parametro che governa detrazioni e bonus.
 */
export type RedditoComplessivo = Marcato<'RedditoComplessivo'>;

/** Importo monetario generico, quando la grandezza non è ambigua. */
export type Euro = number;

export const ral = (valore: number): Ral => valore as Ral;
export const imponibilePrevidenziale = (valore: number): ImponibilePrevidenziale =>
  valore as ImponibilePrevidenziale;
export const redditoComplessivo = (valore: number): RedditoComplessivo =>
  valore as RedditoComplessivo;

/** Numero di mensilità previste dal contratto. */
export type Mensilita = 12 | 13 | 14;

/**
 * Uno scaglione di un'imposta progressiva.
 * `limite` è il tetto superiore dello scaglione; `null` significa "senza tetto".
 */
export interface Scaglione {
  readonly limite: number | null;
  readonly aliquota: number;
}

/**
 * Una singola voce del calcolo, così come viene mostrata all'utente.
 *
 * `fonte` non è documentazione accessoria: è parte del dato. Ogni importo che
 * il calcolatore produce deve poter dire da quale norma discende.
 */
export interface VoceCalcolo {
  readonly etichetta: string;
  readonly importo: Euro;
  readonly spiegazione: string;
  readonly fonte: Fonte;
}

export interface Fonte {
  readonly riferimento: string;
  readonly url: string;
}

/** Esito completo del calcolo: non un numero, ma l'intera scomposizione. */
export interface RisultatoCalcolo {
  readonly ral: Euro;
  readonly mensilita: Mensilita;

  readonly contributi: VoceCalcolo[];
  readonly totaleContributi: Euro;

  readonly imponibileFiscale: Euro;

  readonly irpefLorda: Euro;
  readonly dettaglioScaglioniIrpef: DettaglioScaglione[];
  readonly detrazioni: VoceCalcolo[];
  readonly totaleDetrazioni: Euro;
  readonly irpefNetta: Euro;

  readonly addizionali: VoceCalcolo[];
  readonly totaleAddizionali: Euro;

  readonly bonus: VoceCalcolo | null;

  readonly totaleTrattenute: Euro;
  readonly nettoAnnuo: Euro;
  readonly nettoMensile: Euro;
}

export interface DettaglioScaglione {
  readonly da: number;
  readonly a: number | null;
  readonly aliquota: number;
  readonly imponibileNelloScaglione: Euro;
  readonly imposta: Euro;
}
