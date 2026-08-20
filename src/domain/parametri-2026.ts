import type { Fonte, Scaglione } from './tipi';

/**
 * Parametri normativi dell'anno d'imposta 2026.
 *
 * Questo file è l'unico posto in cui compaiono numeri di legge. La logica di
 * calcolo (`calcolo.ts`) non contiene valori letterali: legge da qui.
 *
 * Il motivo non è estetico. Questi valori cambiano a ogni legge di bilancio:
 * l'aggiornamento annuale deve essere una modifica di dati, non di codice.
 * E ogni valore porta con sé la fonte da cui è stato preso, così che una
 * verifica non richieda di leggere il codice.
 *
 * Ricerca svolta il 20 agosto 2026. Vedi docs/parametri-normativi-2026.md per
 * il dettaglio delle fonti e il livello di affidabilità di ciascuna.
 */

export const ANNO_IMPOSTA = 2026;

// ---------------------------------------------------------------------------
// Fonti
// ---------------------------------------------------------------------------

export const FONTI = {
  leggeBilancio2026: {
    riferimento: 'L. 30 dicembre 2025 n. 199 (Legge di Bilancio 2026), art. 1',
    url: 'https://www.lavoro.gov.it/notizie/pagine/legge-di-bilancio-2026-le-principali-misure-lavoratori-imprese-e-famiglie',
  },
  tuirArt13: {
    riferimento: 'Art. 13, comma 1, TUIR — detrazioni per redditi da lavoro dipendente',
    url: 'https://fiscomania.com/detrazioni-per-redditi-da-lavoro-dipendente/',
  },
  leggeBilancio2025: {
    riferimento: 'L. 207/2024 (Legge di Bilancio 2025), art. 1, commi 4-6',
    url: 'https://www.dipendenti.it/guida/cuneo-fiscale-2026',
  },
  circolareInps: {
    riferimento: 'Circolare INPS n. 6 del 30 gennaio 2026',
    url: 'https://www.informazionefiscale.it/contributi-INPS-2026-dipendenti-istruzioni-calcolo-importo',
  },
  aliquotaIvs: {
    riferimento: 'Aliquota IVS a carico del lavoratore, FPLD industria e commercio',
    url: 'https://fiscomania.com/calcolo-contributi-versati/',
  },
  addizionaleLombardia: {
    riferimento: 'Art. 72 c. 1 L.R. Lombardia 10/2003 — Dipartimento delle Finanze, agg. 28/01/2026',
    url: 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/addregirpef.php?reg=10',
  },
  addizionaleMilano: {
    riferimento: 'Delibera Comune di Milano n. 46 del 28/09/2020 — Portale del federalismo fiscale',
    url: 'https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/risultato.htm?anno=9999&lista=1&pagina=lombardia.htm&pr=MI&cc=F205&r=1',
  },
} as const satisfies Record<string, Fonte>;

// ---------------------------------------------------------------------------
// Contributi previdenziali a carico del lavoratore
// ---------------------------------------------------------------------------

export const CONTRIBUTI = {
  /** Quota IVS a carico del dipendente, FPLD industria e commercio. */
  aliquotaIvs: 0.0919,

  /**
   * Aliquota aggiuntiva dell'1% sulla quota di retribuzione eccedente la prima
   * fascia di retribuzione pensionabile (art. 3-ter L. 438/1992). Si applica ai
   * regimi con aliquota a carico del lavoratore inferiore al 10%: il 9,19%
   * rientra nella condizione.
   */
  aliquotaAggiuntiva: 0.01,
  primaFasciaPensionabile: 56_224,

  /**
   * Massimale annuo della base contributiva e pensionabile.
   * Si applica ai lavoratori privi di anzianità contributiva al 31/12/1995.
   * Il prototipo assume questa condizione: è la semplificazione dichiarata in
   * docs/parametri-normativi-2026.md §5.
   */
  massimaleAnnuo: 122_295,
} as const;

// ---------------------------------------------------------------------------
// IRPEF
// ---------------------------------------------------------------------------

/**
 * Scaglioni IRPEF 2026. Il secondo scaglione è sceso dal 35% al 33% con la
 * Legge di Bilancio 2026.
 */
export const SCAGLIONI_IRPEF: readonly Scaglione[] = [
  { limite: 28_000, aliquota: 0.23 },
  { limite: 50_000, aliquota: 0.33 },
  { limite: null, aliquota: 0.43 },
] as const;

// ---------------------------------------------------------------------------
// Detrazioni per redditi da lavoro dipendente (art. 13 c. 1 TUIR)
// ---------------------------------------------------------------------------

export const DETRAZIONE_LAVORO_DIPENDENTE = {
  /** Fino a 15.000 €: importo fisso. */
  sogliaImportoFisso: 15_000,
  importoFisso: 1_955,
  /** Minimo garantito per il rapporto a tempo indeterminato. */
  minimoGarantito: 690,

  /** 15.000-28.000 €: 1.910 + 1.190 × (28.000 − RC) / 13.000 */
  sogliaSecondaFascia: 28_000,
  baseSecondaFascia: 1_910,
  quotaVariabileSecondaFascia: 1_190,
  ampiezzaSecondaFascia: 13_000,

  /** 28.000-50.000 €: 1.910 × (50.000 − RC) / 22.000 */
  sogliaTerzaFascia: 50_000,
  baseTerzaFascia: 1_910,
  ampiezzaTerzaFascia: 22_000,
} as const;

// ---------------------------------------------------------------------------
// Bonus: somma che non concorre alla formazione del reddito (RC ≤ 20.000 €)
// ---------------------------------------------------------------------------

/**
 * L. 207/2024 art. 1 commi 4-5, reso strutturale dalla L. 199/2025.
 * Ha sostituito il trattamento integrativo del DL 3/2020.
 *
 * La percentuale si applica al reddito **di lavoro dipendente**, e la fascia si
 * determina su quello stesso reddito. La spettanza dipende invece dal reddito
 * complessivo (≤ 20.000 €).
 */
export const BONUS_REDDITI_BASSI = {
  sogliaSpettanza: 20_000,
  fasce: [
    { limite: 8_500, percentuale: 0.071 },
    { limite: 15_000, percentuale: 0.053 },
    { limite: 20_000, percentuale: 0.048 },
  ],
} as const;

// ---------------------------------------------------------------------------
// Ulteriore detrazione (20.000 € < RC ≤ 40.000 €)
// ---------------------------------------------------------------------------

/** L. 207/2024 art. 1 comma 6. */
export const ULTERIORE_DETRAZIONE = {
  sogliaMinima: 20_000,
  sogliaImportoPieno: 32_000,
  sogliaMassima: 40_000,
  importoPieno: 1_000,
} as const;

// ---------------------------------------------------------------------------
// Addizionale regionale — Lombardia
// ---------------------------------------------------------------------------

export const ADDIZIONALE_REGIONALE = {
  regione: 'Lombardia',
  /** Progressiva per scaglioni, come l'IRPEF nazionale. */
  scaglioni: [
    { limite: 15_000, aliquota: 0.0123 },
    { limite: 28_000, aliquota: 0.0158 },
    { limite: 50_000, aliquota: 0.0172 },
    { limite: null, aliquota: 0.0173 },
  ] as readonly Scaglione[],
} as const;

// ---------------------------------------------------------------------------
// Addizionale comunale — Milano
// ---------------------------------------------------------------------------

export const ADDIZIONALE_COMUNALE = {
  comune: 'Milano',
  aliquota: 0.008,

  /**
   * Soglia di esenzione: NON è una franchigia.
   *
   * Se il reddito imponibile supera la soglia, l'addizionale è dovuta
   * sull'intero reddito imponibile, non sulla sola eccedenza. Questo produce
   * una discontinuità: a 23.000 € si pagano 0 €, a 23.001 € se ne pagano ~184.
   * Trattarla come franchigia è l'errore silenzioso più comune in questo
   * calcolo.
   */
  sogliaEsenzione: 23_000,
} as const;
