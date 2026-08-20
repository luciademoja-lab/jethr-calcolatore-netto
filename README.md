# Da RAL a netto — calcolatore 2026

Prototipo che proietta la retribuzione netta annuale e mensile a partire dalla RAL, mostrando ogni
voce trattenuta dal lordo con la norma da cui deriva.

Realizzato come task per il ruolo di AI Product Builder in Jet HR.

---

## Cosa fa

Inserisci una RAL e il numero di mensilità, premi **Calcola** e ottieni:

- il **netto annuo** e il **netto mensile**;
- il **dettaglio voce per voce** delle trattenute: contributi previdenziali, IRPEF lorda esplosa
  scaglione per scaglione, detrazioni, addizionale regionale e comunale, eventuale bonus;
- per ogni voce, il **riferimento normativo cliccabile** da cui il valore proviene;
- le **assunzioni** su cui il calcolo si regge, dichiarate in pagina.

---

## Come è stato costruito

Il criterio dichiarato nella traccia — *«verificare che hai costruito qualcosa di cui hai capito le
logiche e di cui sei in controllo»* — ha guidato tre scelte.

**1. Ricerca prima del codice.** Nessuna riga è stata scritta prima di aver reperito e citato ogni
parametro normativo su fonti primarie. Il risultato di quella fase è in
[`docs/parametri-normativi-2026.md`](docs/parametri-normativi-2026.md), con l'indicazione, per ogni
valore, se è confermato da fonte istituzionale o da fonti professionali concordi.

La ricerca ha corretto tre ipotesi che avevo formulato in fase di discovery — tra cui l'esistenza
del trattamento integrativo, abrogato e sostituito dal 2025. Le correzioni sono registrate nel
documento: erano ipotesi ragionevoli e sbagliate, ed è la fase di ricerca ad averle intercettate
prima che finissero nel codice.

**2. Parametri separati dalla logica.** Tutti i numeri di legge vivono in
[`src/domain/parametri-2026.ts`](src/domain/parametri-2026.ts), ciascuno accanto alla propria fonte.
Il motore di calcolo non contiene valori letterali. L'aggiornamento alla prossima legge di bilancio
è una modifica di dati, non di codice.

**3. Validazione esterna, non solo test verdi.** Un test verde prova che il codice fa quello che il
test dice, non che il test dica la cosa giusta. L'output è stato confrontato con calcolatori
indipendenti su tre RAL campione: risultati e analisi degli scostamenti in
[`docs/validazione.md`](docs/validazione.md).

---

## Assunzioni

Il prototipo modella un caso standard. Ogni semplificazione è una scelta, con un effetto noto sul
risultato.

| Assunzione | Effetto sul risultato |
|---|---|
| Impiegato a tempo indeterminato, full time, CCNL Terziario | — |
| Residenza a Milano (Lombardia) | Determina le addizionali locali |
| Nessun familiare a carico | Il netto mostrato è il **minimo** per quella RAL: con carichi di famiglia è più alto |
| Nessuna agevolazione (impatriati, under 30, decontribuzioni) | Il netto reale sarebbe più alto per chi ne ha diritto |
| Nessuna detrazione per oneri (spese sanitarie, mutuo…) | Nessuno: si recuperano in dichiarazione, non in busta paga |
| Lavoratore soggetto a massimale contributivo | Vale per chi ha iniziato a lavorare dopo il 1996; per gli altri non esiste massimale |
| Proiezione annuale, non simulazione dei cedolini | Nessun conguaglio di fine anno né distribuzione mese per mese |
| Nessuna sterilizzazione detrazioni oltre 200.000 € | Sopra quella soglia il netto è sovrastimato di **al massimo 440 €** |
| TFR e contributi a carico azienda esclusi | Nessuno: non sono retribuzione netta del dipendente |

Sono escluse anche le altre regioni e gli altri comuni: le addizionali comunali sono deliberate da
circa ottomila enti, ed è un problema di raccolta dati, non di logica. Il modello è predisposto per
accoglierli.

---

## Un dettaglio che vale la pena guardare

La soglia di esenzione dell'addizionale comunale di Milano (23.000 €) **non è una franchigia**:
superata la soglia, l'aliquota si applica all'intero reddito imponibile, non alla sola eccedenza.
Ne deriva una discontinuità di circa 184 € — a 23.000 € di imponibile non si paga nulla, a 23.001 €
si pagano 184 €.

Il calcolatore la implementa correttamente, ed è l'unico punto in cui si discosta dal calcolatore
pubblico usato come riferimento. C'è un test dedicato che documenta la discontinuità invece di
nasconderla, perché è comportamento corretto e non un bug.

---

## Struttura

```
src/
  domain/
    tipi.ts              tipi del dominio (RAL, imponibile e netto sono tipi distinti)
    parametri-2026.ts    tutti i parametri normativi, ciascuno con la sua fonte
    calcolo.ts           motore di calcolo: funzioni pure, indipendenti dall'interfaccia
    calcolo.test.ts      38 test sul motore
  components/
    Calcolatore.tsx      interfaccia
    Calcolatore.test.tsx 6 test sul comportamento osservabile dall'utente
  app/
    page.tsx             pagina
docs/
  discovery.md                  perimetro, rischi, piano delle epic
  parametri-normativi-2026.md   ricerca normativa con le fonti
  validazione.md                confronto con calcolatori indipendenti
  decisioni.md                  registro delle decisioni tecniche e di prodotto
```

Il motore è puro e non conosce React: si può testare senza browser, e l'interfaccia è un suo
consumatore. Il risultato del calcolo è un oggetto strutturato che contiene l'intera scomposizione,
non un numero: la trasparenza richiesta dalla traccia è una proprietà del modello dati, non un
abbellimento dell'interfaccia.

---

## Sviluppo

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 44 test
npm run build
```

Stack: Next.js, TypeScript, Tailwind CSS, Vitest, Testing Library.
