import Calcolatore from '@/components/Calcolatore';
import { ANNO_IMPOSTA } from '@/domain/parametri-2026';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Anno d&apos;imposta {ANNO_IMPOSTA}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Da RAL a netto
        </h1>
        <p className="mt-3 text-slate-600">
          Inserisci la retribuzione annua lorda e ottieni il netto annuo, il netto mensile e ogni
          voce trattenuta dal lordo. Ogni importo rimanda alla norma da cui deriva.
        </p>
      </header>

      <Calcolatore />

      <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-500">
        <p>
          Prototipo a scopo dimostrativo. Il calcolo assume un impiegato a tempo indeterminato
          residente a Milano, senza familiari a carico né agevolazioni: non sostituisce una busta
          paga né una consulenza del lavoro.
        </p>
      </footer>
    </main>
  );
}
