# CLAUDE.md — jethr-calcolatore-netto

> Task per il colloquio come AI Product Builder in Jet HR.
> Leggi prima `~/my_projects/CLAUDE.md` e `OPERATING-MANUAL.md`.
> Ultimo aggiornamento: **2026-08-20**.

## Cosa e' e a cosa serve

Prototipo web: input RAL + mensilita' -> netto annuo, netto mensile e tutte le
voci trattenute dal lordo, ognuna con la fonte normativa.

**Il criterio di valutazione vero non e' il calcolatore.** La traccia dice in
grassetto: *"verificare che hai costruito qualcosa di cui hai capito le logiche
e di cui sei in controllo"*. Il valore sta nella tracciabilita': ogni numero ha
la sua fonte, ogni semplificazione e' dichiarata con il suo impatto.

## Stato al 2026-08-20

- **44 test verdi** (38 motore + 6 interfaccia). Build di produzione ok.
- Storia git in 7 commit per fase, che racconta il metodo.
- Fatto: E1 ricerca, E2 dominio, E3 motore, E4 validazione, E5 interfaccia, E6 documentazione.
- **Manca solo E7**: repo su GitHub, board Projects, deploy Vercel, invio email.

## Documentazione (in `docs/`)

- `discovery.md` — perimetro, assunzioni, rischi, piano delle epic
- `parametri-normativi-2026.md` — ogni parametro con fonte e livello di affidabilita'
- `validazione.md` — confronto con calcolatori indipendenti su 3 RAL campione
- `decisioni.md` — 10 decisioni con alternative scartate
- `epics.md` — epic e storie per la board

## Le tre cose da sapere prima di toccare il codice

1. **`parametri-2026.ts` e' l'unico file con numeri di legge.** Il motore non
   contiene valori letterali. Se aggiungi un parametro, aggiungi anche la fonte.
2. **La soglia comunale di Milano non e' una franchigia.** Superati 23.000 EUR
   di imponibile, lo 0,8% si applica all'INTERO reddito. C'e' un test che
   documenta la discontinuita': non "correggerlo".
3. **Il caso di riferimento a RAL 40.000 vale 27.960,25 EUR netti.** Se cambia,
   qualcosa si e' rotto. E' verificato contro due calcolatori esterni.

## Trappole gia' incontrate

- La pagina dell'Agenzia delle Entrate sulle aliquote IRPEF e' ferma al 2020.
  Fonte istituzionale non significa fonte aggiornata.
- Il trattamento integrativo (bonus Renzi) NON esiste piu' dal 2025: sostituito
  da somma non imponibile (<= 20.000) e ulteriore detrazione (20.000-40.000).
- L'arrotondamento manuale sbaglia: il caso a mano dava 1.187,32 dove il codice
  dava 1.187,33, ed e' il codice ad avere ragione.
- `next/font/google` rompe la build senza rete: rimosso di proposito.

## Comandi

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # 44 test
npm run build
```

## Il prossimo passo

E7: repo GitHub, board Projects, deploy Vercel, invio del link in risposta
all'email con task@jethr.com in CC e oggetto invariato.
