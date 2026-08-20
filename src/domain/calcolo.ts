import {
  ADDIZIONALE_COMUNALE,
  ADDIZIONALE_REGIONALE,
  BONUS_REDDITI_BASSI,
  CONTRIBUTI,
  DETRAZIONE_LAVORO_DIPENDENTE,
  FONTI,
  SCAGLIONI_IRPEF,
  ULTERIORE_DETRAZIONE,
} from './parametri-2026';
import {
  redditoComplessivo,
  type DettaglioScaglione,
  type Euro,
  type Mensilita,
  type Ral,
  type RedditoComplessivo,
  type RisultatoCalcolo,
  type Scaglione,
  type VoceCalcolo,
} from './tipi';

/**
 * Motore di calcolo della retribuzione netta.
 *
 * Funzioni pure, senza stato e senza dipendenze dall'interfaccia: si possono
 * testare senza browser. L'interfaccia è un consumatore di questo modulo, non
 * il contrario.
 *
 * Nessun numero di legge compare qui: tutti i parametri vengono da
 * `parametri-2026.ts`, dove ciascuno porta con sé la propria fonte.
 */

/** Arrotonda al centesimo di euro. */
const arrotonda = (valore: number): Euro => Math.round(valore * 100) / 100;

// ---------------------------------------------------------------------------
// Contributi previdenziali
// ---------------------------------------------------------------------------

export interface EsitoContributi {
  readonly ivs: Euro;
  readonly aliquotaAggiuntiva: Euro;
  readonly totale: Euro;
  readonly baseContributiva: Euro;
}

/**
 * Contributi previdenziali a carico del lavoratore.
 *
 * Due componenti: la quota IVS ordinaria sull'intera base contributiva, e
 * l'aliquota aggiuntiva dell'1% sulla sola quota eccedente la prima fascia di
 * retribuzione pensionabile. La base è limitata dal massimale annuo.
 */
export function calcolaContributi(ral: Ral): EsitoContributi {
  const baseContributiva = Math.min(ral, CONTRIBUTI.massimaleAnnuo);

  const ivs = arrotonda(baseContributiva * CONTRIBUTI.aliquotaIvs);

  const quotaEccedente = Math.max(0, baseContributiva - CONTRIBUTI.primaFasciaPensionabile);
  const aliquotaAggiuntiva = arrotonda(quotaEccedente * CONTRIBUTI.aliquotaAggiuntiva);

  return {
    ivs,
    aliquotaAggiuntiva,
    totale: arrotonda(ivs + aliquotaAggiuntiva),
    baseContributiva,
  };
}

// ---------------------------------------------------------------------------
// Imposta progressiva per scaglioni
// ---------------------------------------------------------------------------

export interface EsitoImpostaProgressiva {
  readonly totale: Euro;
  readonly dettaglio: DettaglioScaglione[];
}

/**
 * Applica una scala progressiva a un imponibile.
 *
 * Ogni aliquota si applica solo alla quota di reddito compresa nel proprio
 * scaglione. La stessa funzione serve sia per l'IRPEF nazionale sia per
 * l'addizionale regionale lombarda, che ha la stessa struttura progressiva.
 */
export function calcolaImpostaProgressiva(
  imponibile: number,
  scaglioni: readonly Scaglione[],
): EsitoImpostaProgressiva {
  if (imponibile <= 0) {
    return { totale: 0, dettaglio: [] };
  }

  const dettaglio: DettaglioScaglione[] = [];
  let residuo = imponibile;
  let limiteInferiore = 0;
  let totale = 0;

  for (const scaglione of scaglioni) {
    if (residuo <= 0) break;

    const ampiezza =
      scaglione.limite === null ? residuo : Math.min(residuo, scaglione.limite - limiteInferiore);

    if (ampiezza > 0) {
      const imposta = arrotonda(ampiezza * scaglione.aliquota);
      dettaglio.push({
        da: limiteInferiore,
        a: scaglione.limite,
        aliquota: scaglione.aliquota,
        imponibileNelloScaglione: arrotonda(ampiezza),
        imposta,
      });
      totale += imposta;
      residuo -= ampiezza;
    }

    if (scaglione.limite !== null) limiteInferiore = scaglione.limite;
  }

  return { totale: arrotonda(totale), dettaglio };
}

// ---------------------------------------------------------------------------
// Detrazione per redditi da lavoro dipendente (art. 13 c. 1 TUIR)
// ---------------------------------------------------------------------------

export function calcolaDetrazioneLavoroDipendente(rc: RedditoComplessivo): Euro {
  const p = DETRAZIONE_LAVORO_DIPENDENTE;

  if (rc <= 0) return 0;

  if (rc <= p.sogliaImportoFisso) {
    return arrotonda(Math.max(p.importoFisso, p.minimoGarantito));
  }

  if (rc <= p.sogliaSecondaFascia) {
    const detrazione =
      p.baseSecondaFascia +
      p.quotaVariabileSecondaFascia * ((p.sogliaSecondaFascia - rc) / p.ampiezzaSecondaFascia);
    return arrotonda(Math.max(detrazione, p.minimoGarantito));
  }

  if (rc <= p.sogliaTerzaFascia) {
    const detrazione = p.baseTerzaFascia * ((p.sogliaTerzaFascia - rc) / p.ampiezzaTerzaFascia);
    return arrotonda(Math.max(detrazione, 0));
  }

  return 0;
}

// ---------------------------------------------------------------------------
// Bonus per redditi fino a 20.000 € (L. 207/2024 c. 4-5)
// ---------------------------------------------------------------------------

/**
 * Somma che non concorre alla formazione del reddito.
 *
 * Non è una detrazione d'imposta: è un importo erogato in busta paga, quindi
 * aumenta il netto senza passare dall'IRPEF. La spettanza dipende dal reddito
 * complessivo; la percentuale si determina invece sul reddito di lavoro
 * dipendente.
 */
export function calcolaBonus(rc: RedditoComplessivo, redditoLavoroDipendente: number): Euro {
  if (rc > BONUS_REDDITI_BASSI.sogliaSpettanza || redditoLavoroDipendente <= 0) return 0;

  const fascia = BONUS_REDDITI_BASSI.fasce.find((f) => redditoLavoroDipendente <= f.limite);
  if (!fascia) return 0;

  return arrotonda(redditoLavoroDipendente * fascia.percentuale);
}

// ---------------------------------------------------------------------------
// Ulteriore detrazione tra 20.000 e 40.000 € (L. 207/2024 c. 6)
// ---------------------------------------------------------------------------

export function calcolaUlterioreDetrazione(rc: RedditoComplessivo): Euro {
  const p = ULTERIORE_DETRAZIONE;

  if (rc <= p.sogliaMinima || rc > p.sogliaMassima) return 0;

  if (rc <= p.sogliaImportoPieno) return p.importoPieno;

  return arrotonda(p.importoPieno * ((p.sogliaMassima - rc) / (p.sogliaMassima - p.sogliaImportoPieno)));
}

// ---------------------------------------------------------------------------
// Addizionali
// ---------------------------------------------------------------------------

export function calcolaAddizionaleRegionale(rc: RedditoComplessivo): EsitoImpostaProgressiva {
  return calcolaImpostaProgressiva(rc, ADDIZIONALE_REGIONALE.scaglioni);
}

/**
 * Addizionale comunale di Milano.
 *
 * La soglia di esenzione è una soglia, NON una franchigia: superata la soglia,
 * l'aliquota si applica all'intero reddito imponibile. Ne deriva una
 * discontinuità di circa 184 € attorno ai 23.000 €. È corretto che sia così.
 */
export function calcolaAddizionaleComunale(rc: RedditoComplessivo): Euro {
  if (rc <= ADDIZIONALE_COMUNALE.sogliaEsenzione) return 0;
  return arrotonda(rc * ADDIZIONALE_COMUNALE.aliquota);
}

// ---------------------------------------------------------------------------
// Calcolo completo
// ---------------------------------------------------------------------------

export function calcolaNetto(ral: Ral, mensilita: Mensilita): RisultatoCalcolo {
  if (ral < 0) {
    throw new RangeError('La retribuzione annua lorda non può essere negativa.');
  }

  // 1. Contributi previdenziali a carico del lavoratore.
  const contributi = calcolaContributi(ral);

  const vociContributi: VoceCalcolo[] = [
    {
      etichetta: 'Contributi previdenziali IVS',
      importo: contributi.ivs,
      spiegazione: `${formattaPercentuale(CONTRIBUTI.aliquotaIvs)} su ${formatta(contributi.baseContributiva)}`,
      fonte: FONTI.aliquotaIvs,
    },
  ];

  if (contributi.aliquotaAggiuntiva > 0) {
    vociContributi.push({
      etichetta: 'Aliquota aggiuntiva 1%',
      importo: contributi.aliquotaAggiuntiva,
      spiegazione: `1% sulla quota oltre ${formatta(CONTRIBUTI.primaFasciaPensionabile)}`,
      fonte: FONTI.circolareInps,
    });
  }

  // 2. Imponibile fiscale = reddito complessivo.
  const imponibileFiscale = arrotonda(ral - contributi.totale);
  const rc = redditoComplessivo(imponibileFiscale);

  // 3. IRPEF lorda.
  const irpef = calcolaImpostaProgressiva(imponibileFiscale, SCAGLIONI_IRPEF);

  // 4. Detrazioni.
  const detrazioneLavoro = calcolaDetrazioneLavoroDipendente(rc);
  const ulterioreDetrazione = calcolaUlterioreDetrazione(rc);

  const vociDetrazioni: VoceCalcolo[] = [];
  if (detrazioneLavoro > 0) {
    vociDetrazioni.push({
      etichetta: 'Detrazione per lavoro dipendente',
      importo: detrazioneLavoro,
      spiegazione: 'Decresce al crescere del reddito, si azzera a 50.000 €',
      fonte: FONTI.tuirArt13,
    });
  }
  if (ulterioreDetrazione > 0) {
    vociDetrazioni.push({
      etichetta: 'Ulteriore detrazione',
      importo: ulterioreDetrazione,
      spiegazione: 'Spetta tra 20.000 € e 40.000 € di reddito complessivo',
      fonte: FONTI.leggeBilancio2025,
    });
  }

  const totaleDetrazioni = arrotonda(detrazioneLavoro + ulterioreDetrazione);
  const irpefNetta = arrotonda(Math.max(0, irpef.totale - totaleDetrazioni));

  // 5. Addizionali locali.
  const regionale = calcolaAddizionaleRegionale(rc);
  const comunale = calcolaAddizionaleComunale(rc);

  const vociAddizionali: VoceCalcolo[] = [];
  if (regionale.totale > 0) {
    vociAddizionali.push({
      etichetta: `Addizionale regionale ${ADDIZIONALE_REGIONALE.regione}`,
      importo: regionale.totale,
      spiegazione: 'Progressiva per scaglioni sull\'imponibile fiscale',
      fonte: FONTI.addizionaleLombardia,
    });
  }
  if (comunale > 0) {
    vociAddizionali.push({
      etichetta: `Addizionale comunale ${ADDIZIONALE_COMUNALE.comune}`,
      importo: comunale,
      spiegazione: `${formattaPercentuale(ADDIZIONALE_COMUNALE.aliquota)} sull'intero imponibile (dovuta oltre ${formatta(ADDIZIONALE_COMUNALE.sogliaEsenzione)})`,
      fonte: FONTI.addizionaleMilano,
    });
  }
  const totaleAddizionali = arrotonda(regionale.totale + comunale);

  // 6. Bonus: non è una trattenuta, è un accredito. Entra nel totale con segno
  //    negativo, così che netto + trattenute ricostruisca sempre la RAL.
  const importoBonus = calcolaBonus(rc, imponibileFiscale);
  const bonus: VoceCalcolo | null =
    importoBonus > 0
      ? {
          etichetta: 'Bonus redditi fino a 20.000 € (accredito)',
          importo: importoBonus,
          spiegazione: 'Somma che non concorre al reddito, erogata in busta paga',
          fonte: FONTI.leggeBilancio2025,
        }
      : null;

  // 7. Aggregazione.
  const totaleTrattenute = arrotonda(
    contributi.totale + irpefNetta + totaleAddizionali - importoBonus,
  );
  const nettoAnnuo = arrotonda(ral - totaleTrattenute);
  const nettoMensile = arrotonda(nettoAnnuo / mensilita);

  return {
    ral,
    mensilita,
    contributi: vociContributi,
    totaleContributi: contributi.totale,
    imponibileFiscale,
    irpefLorda: irpef.totale,
    dettaglioScaglioniIrpef: irpef.dettaglio,
    detrazioni: vociDetrazioni,
    totaleDetrazioni,
    irpefNetta,
    addizionali: vociAddizionali,
    totaleAddizionali,
    bonus,
    totaleTrattenute,
    nettoAnnuo,
    nettoMensile,
  };
}

function formatta(valore: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(valore);
}

function formattaPercentuale(valore: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valore);
}
