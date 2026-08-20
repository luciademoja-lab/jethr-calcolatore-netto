'use client';

import { useState, type FormEvent } from 'react';
import { calcolaNetto } from '@/domain/calcolo';
import { ral as creaRal, type Mensilita, type RisultatoCalcolo, type VoceCalcolo } from '@/domain/tipi';
import { ADDIZIONALE_COMUNALE, ADDIZIONALE_REGIONALE, ANNO_IMPOSTA } from '@/domain/parametri-2026';

const euro = (valore: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(valore);

const percentuale = (valore: number) =>
  new Intl.NumberFormat('it-IT', { style: 'percent', maximumFractionDigits: 2 }).format(valore);

export default function Calcolatore() {
  const [ralInput, setRalInput] = useState('40000');
  const [mensilita, setMensilita] = useState<Mensilita>(14);
  const [risultato, setRisultato] = useState<RisultatoCalcolo | null>(null);
  const [errore, setErrore] = useState<string | null>(null);

  function onCalcola(evento: FormEvent) {
    evento.preventDefault();
    const valore = Number(ralInput.replace(/\./g, '').replace(',', '.'));

    if (!Number.isFinite(valore) || valore < 0) {
      setErrore('Inserisci una retribuzione annua lorda valida.');
      setRisultato(null);
      return;
    }

    setErrore(null);
    setRisultato(calcolaNetto(creaRal(valore), mensilita));
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onCalcola} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div>
            <label htmlFor="ral" className="block text-sm font-medium text-slate-700">
              Retribuzione annua lorda (RAL)
            </label>
            <div className="mt-1 flex items-center rounded-lg border border-slate-300 focus-within:border-slate-900">
              <span className="pl-3 text-slate-500">€</span>
              <input
                id="ral"
                name="ral"
                type="text"
                inputMode="decimal"
                value={ralInput}
                onChange={(e) => setRalInput(e.target.value)}
                className="w-full rounded-lg px-2 py-2.5 text-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mensilita" className="block text-sm font-medium text-slate-700">
              Mensilità
            </label>
            <select
              id="mensilita"
              value={mensilita}
              onChange={(e) => setMensilita(Number(e.target.value) as Mensilita)}
              className="mt-1 rounded-lg border border-slate-300 px-3 py-2.5 text-lg outline-none focus:border-slate-900"
            >
              <option value={12}>12</option>
              <option value={13}>13</option>
              <option value={14}>14</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-700"
          >
            Calcola
          </button>
        </div>

        {errore && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {errore}
          </p>
        )}
      </form>

      {risultato && <Risultato dati={risultato} />}
    </div>
  );
}

function Risultato({ dati }: { dati: RisultatoCalcolo }) {
  return (
    <section aria-label="Risultato del calcolo" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Riquadro titolo="Netto annuo" valore={euro(dati.nettoAnnuo)} enfasi />
        <Riquadro
          titolo={`Netto mensile (${dati.mensilita} mensilità)`}
          valore={euro(dati.nettoMensile)}
          enfasi
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Riquadro titolo="Totale trattenute" valore={euro(dati.totaleTrattenute)} />
        <Riquadro titolo="Imponibile fiscale" valore={euro(dati.imponibileFiscale)} />
        <Riquadro
          titolo="Pressione effettiva"
          valore={dati.ral > 0 ? percentuale(dati.totaleTrattenute / dati.ral) : '—'}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Dettaglio delle voci trattenute dalla retribuzione lorda</caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3">Voce</th>
              <th scope="col" className="px-5 py-3 text-right">Importo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <RigaTotale etichetta="Retribuzione annua lorda" importo={dati.ral} />

            <RigaSezione titolo="Contributi previdenziali" />
            {dati.contributi.map((voce) => (
              <RigaVoce key={voce.etichetta} voce={voce} segno="−" />
            ))}

            <RigaTotale etichetta="Imponibile fiscale" importo={dati.imponibileFiscale} />

            <RigaSezione titolo="IRPEF" />
            <tr>
              <td className="px-5 py-3">
                <span className="font-medium text-slate-800">IRPEF lorda</span>
                <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
                  {dati.dettaglioScaglioniIrpef.map((s) => (
                    <li key={`${s.da}-${s.aliquota}`}>
                      {euro(s.imponibileNelloScaglione)} da {euro(s.da)}
                      {s.a === null ? ' in su' : ` a ${euro(s.a)}`} · {percentuale(s.aliquota)} ={' '}
                      {euro(s.imposta)}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-5 py-3 text-right align-top font-mono">− {euro(dati.irpefLorda)}</td>
            </tr>

            {dati.detrazioni.map((voce) => (
              <RigaVoce key={voce.etichetta} voce={voce} segno="+" />
            ))}

            <RigaTotale etichetta="IRPEF netta" importo={dati.irpefNetta} segno="−" />

            <RigaSezione titolo="Addizionali locali" />
            {dati.addizionali.length === 0 && (
              <tr>
                <td className="px-5 py-3 text-slate-500" colSpan={2}>
                  Nessuna addizionale dovuta a questo livello di reddito.
                </td>
              </tr>
            )}
            {dati.addizionali.map((voce) => (
              <RigaVoce key={voce.etichetta} voce={voce} segno="−" />
            ))}

            {dati.bonus && (
              <>
                <RigaSezione titolo="Integrazioni a favore del lavoratore" />
                <RigaVoce voce={dati.bonus} segno="+" />
              </>
            )}
          </tbody>
          <tfoot className="bg-slate-900 text-white">
            <tr>
              <th scope="row" className="px-5 py-4 text-left font-semibold">Netto annuo</th>
              <td className="px-5 py-4 text-right font-mono text-lg font-semibold">
                {euro(dati.nettoAnnuo)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Assunzioni />
    </section>
  );
}

function Riquadro({ titolo, valore, enfasi = false }: { titolo: string; valore: string; enfasi?: boolean }) {
  return (
    <div
      className={
        enfasi
          ? 'rounded-2xl bg-slate-900 p-6 text-white'
          : 'rounded-2xl border border-slate-200 bg-white p-5'
      }
    >
      <p className={enfasi ? 'text-sm text-slate-300' : 'text-sm text-slate-500'}>{titolo}</p>
      <p className={enfasi ? 'mt-1 text-3xl font-semibold' : 'mt-1 text-xl font-semibold text-slate-900'}>
        {valore}
      </p>
    </div>
  );
}

function RigaSezione({ titolo }: { titolo: string }) {
  return (
    <tr className="bg-slate-50">
      <th scope="colgroup" colSpan={2} className="px-5 py-2 text-left text-xs uppercase tracking-wide text-slate-500">
        {titolo}
      </th>
    </tr>
  );
}

function RigaVoce({ voce, segno }: { voce: VoceCalcolo; segno: '+' | '−' }) {
  return (
    <tr>
      <td className="px-5 py-3">
        <span className="font-medium text-slate-800">{voce.etichetta}</span>
        <p className="text-xs text-slate-500">{voce.spiegazione}</p>
        <a
          href={voce.fonte.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs text-slate-500 underline decoration-dotted underline-offset-2 hover:text-slate-900"
        >
          {voce.fonte.riferimento}
        </a>
      </td>
      <td className="px-5 py-3 text-right align-top font-mono">
        {segno} {euro(voce.importo)}
      </td>
    </tr>
  );
}

function RigaTotale({ etichetta, importo, segno }: { etichetta: string; importo: number; segno?: '−' }) {
  return (
    <tr className="bg-white">
      <th scope="row" className="px-5 py-3 text-left font-semibold text-slate-900">{etichetta}</th>
      <td className="px-5 py-3 text-right font-mono font-semibold">
        {segno ? `${segno} ` : ''}
        {euro(importo)}
      </td>
    </tr>
  );
}

function Assunzioni() {
  return (
    <details className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
      <summary className="cursor-pointer font-medium text-slate-900">
        Assunzioni e semplificazioni di questo calcolo
      </summary>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        <li>Anno d&apos;imposta {ANNO_IMPOSTA}.</li>
        <li>Impiegato a tempo indeterminato, full time, CCNL Terziario.</li>
        <li>
          Residenza in {ADDIZIONALE_COMUNALE.comune} ({ADDIZIONALE_REGIONALE.regione}).
        </li>
        <li>Nessun familiare a carico: il netto mostrato è quindi il minimo per questa RAL.</li>
        <li>Nessuna agevolazione (impatriati, under 30, decontribuzioni).</li>
        <li>Nessuna detrazione per oneri: quelle si recuperano in dichiarazione, non in busta paga.</li>
        <li>
          Contributi soggetti al massimale annuo: ipotesi valida per chi ha iniziato a lavorare dopo
          il 1996.
        </li>
        <li>Proiezione annuale: non simula i singoli cedolini né il conguaglio di fine anno.</li>
      </ul>
    </details>
  );
}
