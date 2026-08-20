# Epic e storie — board GitHub Projects

Board proposta con quattro colonne: **Backlog · In corso · In review · Fatto**.
Lo stato indicato è quello reale al 20 agosto 2026.

---

## E1 — Ricerca normativa · ✅ Fatto

**Obiettivo.** Reperire su fonti primarie ogni parametro necessario al calcolo per l'anno 2026, con
citazione verificabile.

| # | Storia | Stato |
|---|---|---|
| E1.1 | Come sviluppatrice, voglio conoscere aliquote e scaglioni IRPEF 2026 con il riferimento di legge | ✅ |
| E1.2 | Voglio le formule delle detrazioni da lavoro dipendente per fascia di reddito | ✅ |
| E1.3 | Voglio sapere cosa è subentrato al trattamento integrativo dal 2025 | ✅ |
| E1.4 | Voglio l'aliquota contributiva a carico del dipendente, la prima fascia pensionabile e il massimale | ✅ |
| E1.5 | Voglio scaglioni e aliquote dell'addizionale regionale lombarda | ✅ |
| E1.6 | Voglio aliquota e soglia di esenzione dell'addizionale comunale di Milano | ✅ |
| E1.7 | Voglio capire se la soglia comunale è una soglia o una franchigia | ✅ |

**Definition of done.** Ogni parametro ha una fonte citata e un livello di affidabilità dichiarato.
**Esito.** `docs/parametri-normativi-2026.md`. Tre ipotesi della discovery corrette.

---

## E2 — Modello del dominio e configurazione · ✅ Fatto

| # | Storia | Stato |
|---|---|---|
| E2.1 | Voglio tipi distinti per RAL, imponibile previdenziale e reddito complessivo | ✅ |
| E2.2 | Voglio tutti i parametri normativi in un solo file, ciascuno con la sua fonte | ✅ |
| E2.3 | Voglio che il risultato del calcolo sia una struttura completa, non un numero | ✅ |

**Definition of done.** Nessun numero di legge compare fuori da `parametri-2026.ts`.

---

## E3 — Motore di calcolo (TDD) · ✅ Fatto

| # | Storia | Stato |
|---|---|---|
| E3.1 | Come utente voglio che i contributi previdenziali siano calcolati correttamente, inclusa l'aliquota aggiuntiva e il massimale | ✅ |
| E3.2 | Voglio l'IRPEF calcolata progressivamente per scaglioni | ✅ |
| E3.3 | Voglio le detrazioni da lavoro dipendente applicate per fascia | ✅ |
| E3.4 | Voglio il bonus per redditi fino a 20.000 € | ✅ |
| E3.5 | Voglio l'ulteriore detrazione tra 20.000 e 40.000 € | ✅ |
| E3.6 | Voglio le addizionali regionale e comunale, con la soglia gestita come soglia | ✅ |
| E3.7 | Voglio che netto + trattenute ricostruisca sempre la RAL | ✅ |

**Definition of done.** Test scritto prima dell'implementazione; casi limite coperti; nessun numero
letterale nel motore.
**Esito.** 38 test verdi.

---

## E4 — Validazione esterna · ✅ Fatto

| # | Storia | Stato |
|---|---|---|
| E4.1 | Confronto su RAL 40.000 € con due calcolatori indipendenti | ✅ |
| E4.2 | Confronto su RAL 25.000 € (fascia con ulteriore detrazione) | ✅ |
| E4.3 | Confronto su RAL 70.000 € (oltre prima fascia pensionabile) | ✅ |
| E4.4 | Ogni scostamento spiegato e ricondotto a una scelta dichiarata | ✅ |

**Definition of done.** Combaciare con almeno due calcolatori su tre RAL campione, o spiegare lo
scostamento.
**Esito.** `docs/validazione.md`. Due coincidenze esatte, uno scostamento spiegato al centesimo.

---

## E5 — Interfaccia · ✅ Fatto

| # | Storia | Stato |
|---|---|---|
| E5.1 | Come utente voglio inserire la RAL e le mensilità e premere Calcola | ✅ |
| E5.2 | Voglio vedere netto annuo e netto mensile in evidenza | ✅ |
| E5.3 | Voglio il dettaglio voce per voce di tutto ciò che viene trattenuto | ✅ |
| E5.4 | Voglio poter risalire alla norma dietro ogni importo | ✅ |
| E5.5 | Voglio vedere l'IRPEF esplosa scaglione per scaglione | ✅ |
| E5.6 | Voglio sapere su quali assunzioni si regge il numero che leggo | ✅ |
| E5.7 | Voglio un messaggio chiaro se inserisco un valore non valido | ✅ |
| E5.8 | Voglio poterlo usare dal telefono | ✅ |

**Esito.** 6 test sul comportamento osservabile; verifica visiva desktop e mobile.

---

## E6 — Documentazione · ✅ Fatto

| # | Storia | Stato |
|---|---|---|
| E6.1 | README con assunzioni e impatto di ciascuna sul risultato | ✅ |
| E6.2 | Registro delle decisioni con alternative scartate | ✅ |
| E6.3 | Documento di discovery con perimetro e rischi | ✅ |

---

## E7 — Deploy · ⏳ In corso

| # | Storia | Stato |
|---|---|---|
| E7.1 | Repository pubblico su GitHub | ⏳ |
| E7.2 | Board GitHub Projects con le epic | ⏳ |
| E7.3 | Deploy su Vercel con link pubblico | ⏳ |
| E7.4 | Verifica del sito in produzione da desktop e mobile | ⏳ |
| E7.5 | Invio del link in risposta all'email, con task@jethr.com in CC e oggetto invariato | ⏳ |

---

## Backlog — fuori dal perimetro dell'MVP

Non sono cose dimenticate: sono cose escluse con motivo, tenute visibili perché la conversazione al
colloquio possa toccarle.

| # | Storia | Perché è fuori |
|---|---|---|
| B1 | Selezione di regione e comune | Circa ottomila delibere comunali: problema di raccolta dati, non di logica |
| B2 | Familiari a carico | Casistica ampia, moltiplicherebbe i rami da testare |
| B3 | Anno d'imposta selezionabile | Raddoppierebbe ricerca normativa e test |
| B4 | Costo azienda | La domanda posta riguarda il netto del dipendente |
| B5 | Simulazione dei singoli cedolini e conguaglio | Il prototipo è una proiezione annuale |
| B6 | Agevolazioni (impatriati, under 30, decontribuzioni) | Escluse esplicitamente dalla traccia |
| B7 | Confronto tra due RAL affiancate | Utile in un prodotto, non necessario al prototipo |
