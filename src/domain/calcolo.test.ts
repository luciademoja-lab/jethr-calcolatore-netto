import { describe, it, expect } from 'vitest';
import {
  calcolaContributi,
  calcolaImpostaProgressiva,
  calcolaDetrazioneLavoroDipendente,
  calcolaBonus,
  calcolaUlterioreDetrazione,
  calcolaAddizionaleComunale,
  calcolaNetto,
} from './calcolo';
import {
  SCAGLIONI_IRPEF,
  CONTRIBUTI,
  ADDIZIONALE_COMUNALE,
} from './parametri-2026';
import { ral, redditoComplessivo } from './tipi';

/** Tolleranza per i confronti in euro: un centesimo. */
const CENT = 0.01;

describe('contributi previdenziali a carico del lavoratore', () => {
  it('applica il 9,19% sotto la prima fascia di retribuzione pensionabile', () => {
    const esito = calcolaContributi(ral(30_000));
    expect(esito.totale).toBeCloseTo(30_000 * 0.0919, 2);
    expect(esito.aliquotaAggiuntiva).toBe(0);
  });

  it('aggiunge l\'1% solo sulla quota eccedente la prima fascia', () => {
    const soglia = CONTRIBUTI.primaFasciaPensionabile;
    const esito = calcolaContributi(ral(soglia + 10_000));
    expect(esito.ivs).toBeCloseTo((soglia + 10_000) * 0.0919, 2);
    expect(esito.aliquotaAggiuntiva).toBeCloseTo(10_000 * 0.01, 2);
  });

  it('non applica l\'1% esattamente sulla soglia della prima fascia', () => {
    const esito = calcolaContributi(ral(CONTRIBUTI.primaFasciaPensionabile));
    expect(esito.aliquotaAggiuntiva).toBe(0);
  });

  it('non calcola contributi sulla quota eccedente il massimale annuo', () => {
    const oltreMassimale = CONTRIBUTI.massimaleAnnuo + 50_000;
    const alMassimale = calcolaContributi(ral(CONTRIBUTI.massimaleAnnuo));
    const sopra = calcolaContributi(ral(oltreMassimale));
    expect(sopra.totale).toBeCloseTo(alMassimale.totale, 2);
  });

  it('restituisce zero su RAL nulla', () => {
    expect(calcolaContributi(ral(0)).totale).toBe(0);
  });
});

describe('imposta progressiva per scaglioni', () => {
  it('applica una sola aliquota se il reddito sta nel primo scaglione', () => {
    const esito = calcolaImpostaProgressiva(20_000, SCAGLIONI_IRPEF);
    expect(esito.totale).toBeCloseTo(20_000 * 0.23, 2);
    expect(esito.dettaglio).toHaveLength(1);
  });

  it('tassa ogni scaglione solo per la sua quota di reddito', () => {
    // 28.000 al 23% + 7.000 al 33%
    const esito = calcolaImpostaProgressiva(35_000, SCAGLIONI_IRPEF);
    expect(esito.totale).toBeCloseTo(28_000 * 0.23 + 7_000 * 0.33, 2);
    expect(esito.dettaglio).toHaveLength(2);
  });

  it('gestisce il reddito esattamente sul confine di scaglione', () => {
    const esito = calcolaImpostaProgressiva(28_000, SCAGLIONI_IRPEF);
    expect(esito.totale).toBeCloseTo(28_000 * 0.23, 2);
    expect(esito.dettaglio).toHaveLength(1);
  });

  it('applica l\'aliquota massima sulla quota oltre l\'ultimo limite', () => {
    const esito = calcolaImpostaProgressiva(60_000, SCAGLIONI_IRPEF);
    const atteso = 28_000 * 0.23 + 22_000 * 0.33 + 10_000 * 0.43;
    expect(esito.totale).toBeCloseTo(atteso, 2);
    expect(esito.dettaglio).toHaveLength(3);
  });

  it('restituisce zero su imponibile nullo o negativo', () => {
    expect(calcolaImpostaProgressiva(0, SCAGLIONI_IRPEF).totale).toBe(0);
    expect(calcolaImpostaProgressiva(-100, SCAGLIONI_IRPEF).totale).toBe(0);
  });
});

describe('detrazione per redditi da lavoro dipendente (art. 13 TUIR)', () => {
  it('vale 1.955 € fino a 15.000 € di reddito complessivo', () => {
    expect(calcolaDetrazioneLavoroDipendente(redditoComplessivo(12_000))).toBeCloseTo(1_955, 2);
    expect(calcolaDetrazioneLavoroDipendente(redditoComplessivo(15_000))).toBeCloseTo(1_955, 2);
  });

  it('decresce linearmente tra 15.000 e 28.000 €', () => {
    const rc = 20_000;
    const atteso = 1_910 + 1_190 * ((28_000 - rc) / 13_000);
    expect(calcolaDetrazioneLavoroDipendente(redditoComplessivo(rc))).toBeCloseTo(atteso, 2);
  });

  it('decresce fino ad azzerarsi tra 28.000 e 50.000 €', () => {
    const rc = 36_324;
    const atteso = 1_910 * ((50_000 - rc) / 22_000);
    expect(calcolaDetrazioneLavoroDipendente(redditoComplessivo(rc))).toBeCloseTo(atteso, 2);
  });

  it('è nulla oltre 50.000 €', () => {
    expect(calcolaDetrazioneLavoroDipendente(redditoComplessivo(50_000))).toBeCloseTo(0, 2);
    expect(calcolaDetrazioneLavoroDipendente(redditoComplessivo(80_000))).toBe(0);
  });

  it('non scende mai sotto il minimo garantito quando la detrazione spetta', () => {
    // Al confine dei 15.000 € la formula della seconda fascia darebbe 3.100 €,
    // quindi il minimo garantito non morde: serve comunque che non sia negativa.
    expect(calcolaDetrazioneLavoroDipendente(redditoComplessivo(14_999))).toBeGreaterThanOrEqual(690);
  });
});

describe('bonus per redditi fino a 20.000 € (L. 207/2024 c. 4-5)', () => {
  it('applica il 7,1% fino a 8.500 € di reddito di lavoro dipendente', () => {
    expect(calcolaBonus(redditoComplessivo(8_000), 8_000)).toBeCloseTo(8_000 * 0.071, 2);
  });

  it('applica il 5,3% tra 8.500 e 15.000 €', () => {
    expect(calcolaBonus(redditoComplessivo(12_000), 12_000)).toBeCloseTo(12_000 * 0.053, 2);
  });

  it('applica il 4,8% tra 15.000 e 20.000 €', () => {
    expect(calcolaBonus(redditoComplessivo(18_000), 18_000)).toBeCloseTo(18_000 * 0.048, 2);
  });

  it('non spetta se il reddito complessivo supera 20.000 €', () => {
    expect(calcolaBonus(redditoComplessivo(20_001), 20_001)).toBe(0);
  });

  it('spetta ancora esattamente a 20.000 €', () => {
    expect(calcolaBonus(redditoComplessivo(20_000), 20_000)).toBeCloseTo(20_000 * 0.048, 2);
  });
});

describe('ulteriore detrazione tra 20.000 e 40.000 € (L. 207/2024 c. 6)', () => {
  it('non spetta fino a 20.000 € (dove opera invece il bonus)', () => {
    expect(calcolaUlterioreDetrazione(redditoComplessivo(20_000))).toBe(0);
  });

  it('vale 1.000 € tra 20.000 e 32.000 €', () => {
    expect(calcolaUlterioreDetrazione(redditoComplessivo(25_000))).toBeCloseTo(1_000, 2);
    expect(calcolaUlterioreDetrazione(redditoComplessivo(32_000))).toBeCloseTo(1_000, 2);
  });

  it('decresce linearmente tra 32.000 e 40.000 €', () => {
    expect(calcolaUlterioreDetrazione(redditoComplessivo(36_000))).toBeCloseTo(500, 2);
  });

  it('non spetta oltre 40.000 €', () => {
    expect(calcolaUlterioreDetrazione(redditoComplessivo(40_000))).toBeCloseTo(0, 2);
    expect(calcolaUlterioreDetrazione(redditoComplessivo(45_000))).toBe(0);
  });
});

describe('addizionale comunale di Milano: la soglia non è una franchigia', () => {
  it('non è dovuta fino alla soglia di esenzione', () => {
    expect(calcolaAddizionaleComunale(redditoComplessivo(23_000))).toBe(0);
  });

  it('superata la soglia si applica sull\'INTERO reddito, non sull\'eccedenza', () => {
    const rc = 23_001;
    // L'errore da non commettere sarebbe: (23.001 − 23.000) × 0,8% = 0,008 €
    expect(calcolaAddizionaleComunale(redditoComplessivo(rc))).toBeCloseTo(rc * 0.008, 2);
  });

  it('produce la discontinuità attesa attorno alla soglia', () => {
    const sotto = calcolaAddizionaleComunale(redditoComplessivo(ADDIZIONALE_COMUNALE.sogliaEsenzione));
    const sopra = calcolaAddizionaleComunale(redditoComplessivo(ADDIZIONALE_COMUNALE.sogliaEsenzione + 1));
    expect(sotto).toBe(0);
    expect(sopra).toBeGreaterThan(180);
  });
});

describe('calcolo completo del netto', () => {
  it('riproduce il caso di riferimento a RAL 40.000 €', () => {
    // Caso ricalcolato a mano in docs/parametri-normativi-2026.md §10.
    const r = calcolaNetto(ral(40_000), 14);

    expect(r.totaleContributi).toBeCloseTo(3_676, 2);
    expect(r.imponibileFiscale).toBeCloseTo(36_324, 2);
    expect(r.irpefLorda).toBeCloseTo(9_186.92, 2);
    // Detrazione lavoro dipendente: 1.910 × (50.000 − 36.324) / 22.000 = 1.187,33
    // Ulteriore detrazione:          1.000 × (40.000 − 36.324) / 8.000  =   459,50
    expect(r.totaleDetrazioni).toBeCloseTo(1_187.33 + 459.5, 2);
    expect(r.irpefNetta).toBeCloseTo(7_540.09, 2);
    expect(r.totaleAddizionali).toBeCloseTo(533.07 + 290.59, 2);
    expect(r.nettoAnnuo).toBeCloseTo(27_960.25, 2);
    expect(r.nettoMensile).toBeCloseTo(27_960.25 / 14, 1);
  });

  it('la somma delle trattenute e del netto ricostruisce sempre la RAL', () => {
    for (const importo of [15_000, 25_000, 40_000, 70_000, 150_000]) {
      const r = calcolaNetto(ral(importo), 13);
      expect(r.nettoAnnuo + r.totaleTrattenute).toBeCloseTo(importo, 1);
    }
  });

  it('il netto cresce al crescere della RAL su tutto l\'intervallo di interesse', () => {
    let precedente = -Infinity;
    for (let importo = 5_000; importo <= 200_000; importo += 250) {
      const netto = calcolaNetto(ral(importo), 12).nettoAnnuo;
      // Unica eccezione ammessa: la discontinuità della soglia comunale,
      // verificata puntualmente nel test successivo.
      const rc = importo - calcolaNetto(ral(importo), 12).totaleContributi;
      const attraversaSoglia =
        rc > ADDIZIONALE_COMUNALE.sogliaEsenzione &&
        rc - 250 <= ADDIZIONALE_COMUNALE.sogliaEsenzione;
      if (!attraversaSoglia) {
        expect(netto).toBeGreaterThan(precedente);
      }
      precedente = netto;
    }
  });

  it('la soglia comunale crea una discontinuità reale: guadagnare 1 € in più fa perdere netto', () => {
    // Non è un bug del calcolatore: è come funziona la soglia di esenzione.
    // Il test esiste per documentarla, non per nasconderla.
    const soglia = ADDIZIONALE_COMUNALE.sogliaEsenzione;
    const ralSottoSoglia = soglia / (1 - CONTRIBUTI.aliquotaIvs);
    const sotto = calcolaNetto(ral(Math.floor(ralSottoSoglia)), 12);
    const sopra = calcolaNetto(ral(Math.ceil(ralSottoSoglia) + 20), 12);

    expect(sotto.imponibileFiscale).toBeLessThanOrEqual(soglia);
    expect(sopra.imponibileFiscale).toBeGreaterThan(soglia);
    expect(sopra.nettoAnnuo).toBeLessThan(sotto.nettoAnnuo);
  });

  it('divide il netto per il numero di mensilità indicato', () => {
    const r = calcolaNetto(ral(40_000), 12);
    expect(r.nettoMensile).toBeCloseTo(r.nettoAnnuo / 12, 2);
  });

  it('sui redditi bassi il bonus aumenta il netto oltre il lordo meno trattenute fiscali', () => {
    const r = calcolaNetto(ral(15_000), 14);
    expect(r.bonus).not.toBeNull();
    expect(r.bonus!.importo).toBeGreaterThan(0);
  });

  it('non produce IRPEF netta negativa quando le detrazioni superano l\'imposta', () => {
    const r = calcolaNetto(ral(10_000), 14);
    expect(r.irpefNetta).toBeGreaterThanOrEqual(0);
  });

  it('rifiuta una RAL negativa', () => {
    expect(() => calcolaNetto(ral(-1), 12)).toThrow();
  });

  it('tratta la RAL nulla come caso degenere senza esplodere', () => {
    const r = calcolaNetto(ral(0), 12);
    expect(r.nettoAnnuo).toBe(0);
    expect(r.totaleTrattenute).toBe(0);
  });

  it('ogni voce mostrata all\'utente porta con sé la propria fonte', () => {
    const r = calcolaNetto(ral(40_000), 14);
    const voci = [...r.contributi, ...r.detrazioni, ...r.addizionali];
    expect(voci.length).toBeGreaterThan(0);
    for (const voce of voci) {
      expect(voce.fonte.riferimento.length).toBeGreaterThan(0);
      expect(voce.fonte.url).toMatch(/^https?:\/\//);
    }
  });

  it('gli importi esposti sono arrotondati al centesimo', () => {
    const r = calcolaNetto(ral(37_333), 14);
    for (const valore of [r.nettoAnnuo, r.irpefNetta, r.totaleContributi, r.totaleAddizionali]) {
      expect(Math.abs(valore * 100 - Math.round(valore * 100))).toBeLessThan(CENT);
    }
  });
});
