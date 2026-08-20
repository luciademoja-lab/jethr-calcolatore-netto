# Registro delle decisioni

Ogni voce riporta la decisione, il contesto, le alternative scartate e il motivo.
Serve a rendere discutibile ciò che è stato scelto, non solo ciò che è stato costruito.

---

## D1 — Un solo input oltre alla RAL

**Decisione.** L'utente inserisce solo RAL e numero di mensilità. Regione, comune, tipo di contratto
e situazione familiare sono assunzioni fisse, dichiarate in pagina.

**Alternative scartate.** Aggiungere familiari a carico e comune selezionabile; costruire un profilo
completo.

**Perché.** La traccia autorizza esplicitamente il caso standard. Ogni input aggiunto è una regola
in più da ricercare, testare e difendere: la qualità di un percorso verificato vale più
dell'ampiezza di dieci percorsi non verificati. Il rischio principale del progetto non è "coprire
pochi casi", è "dare un numero sbagliato con sicurezza".

---

## D2 — Anno d'imposta 2026, non 2025

**Decisione.** Il calcolo usa i parametri dell'anno in corso.

**Alternative scartate.** Usare il 2025, l'ultimo anno chiuso, con tutti i valori certi; rendere
l'anno selezionabile.

**Perché.** Un prodotto payroll usato oggi calcola sull'anno corrente. La selezione dell'anno
avrebbe raddoppiato la ricerca normativa e i test per un beneficio che nessun utente del prototipo
avrebbe usato. La struttura del file dei parametri rende comunque semplice aggiungere un secondo
anno.

**Conseguenza accettata.** Ha richiesto di verificare la Legge di Bilancio 2026 (L. 199/2025), che
ha modificato la seconda aliquota IRPEF dal 35% al 33%. Un calcolatore tarato sul 2025 avrebbe dato
risultati sbagliati per l'intera fascia 28.000–50.000 €.

---

## D3 — Parametri normativi separati dalla logica, con la fonte accanto al valore

**Decisione.** `parametri-2026.ts` è l'unico file che contiene numeri di legge. Ogni parametro ha un
riferimento normativo e un URL.

**Alternative scartate.** Valori letterali nel codice di calcolo; parametri in un JSON senza
commenti.

**Perché.** Tre ragioni, in ordine: difendibilità (un solo file da aprire per verificare ogni
valore), manutenibilità (questi numeri cambiano ogni legge di bilancio, e l'aggiornamento deve
essere una modifica di dati), estensibilità (aggiungere un comune o un anno non richiede di toccare
il motore).

---

## D4 — Tipi distinti per RAL, imponibile fiscale e reddito complessivo

**Decisione.** Non sono tutti `number`: sono tipi nominali distinti, con costruttori espliciti.

**Alternative scartate.** Usare `number` ovunque, con nomi di variabile chiari.

**Perché.** In questo dominio confondere la RAL con l'imponibile fiscale produce un errore di
alcune migliaia di euro l'anno, e il risultato resta plausibile. Con tipi distinti quello scambio è
un errore di compilazione. È il punto in cui TypeScript smette di essere decorativo.

**Costo accettato.** Un po' di cerimonia nei costruttori (`ral(40000)` invece di `40000`).

---

## D5 — Il motore restituisce la scomposizione, non un numero

**Decisione.** `calcolaNetto` restituisce un oggetto con ogni voce, il suo importo, la sua
spiegazione e la sua fonte. L'interfaccia si limita a renderizzarlo.

**Alternative scartate.** Restituire il netto e ricostruire il dettaglio nell'interfaccia.

**Perché.** La traccia chiede di mostrare tutte le voci trattenute. Se il dettaglio si costruisse
nell'interfaccia, potrebbe divergere dal calcolo effettivo senza che nessun test se ne accorga.
Così, ciò che l'utente legge è per costruzione ciò che il motore ha calcolato.

---

## D6 — Il bonus entra nel totale come trattenuta negativa

**Decisione.** Il bonus per redditi fino a 20.000 € è esposto come voce a sé ("accredito") ma
sottratto dal totale delle trattenute.

**Alternative scartate.** Sommarlo al netto separatamente.

**Perché.** Mantiene vera l'identità `netto + trattenute = RAL` per ogni livello di reddito, che è
la proprietà che rende la tabella leggibile e verificabile a colpo d'occhio. C'è un test che la
controlla su cinque RAL diverse.

---

## D7 — Arrotondamento al centesimo su ogni voce, netto calcolato per differenza

**Decisione.** Ogni voce esposta è arrotondata al centesimo; il netto è la RAL meno la somma delle
voci arrotondate.

**Alternative scartate.** Calcolare tutto in virgola mobile e arrotondare solo alla fine.

**Perché.** Con l'arrotondamento solo finale, la somma delle voci mostrate non tornerebbe sempre
con il netto mostrato, e un utente che rifà i conti a mano troverebbe una differenza di centesimi.
Meglio una tabella che quadra sempre.

**Nota.** Questa scelta ha rivelato un errore: il caso di riferimento calcolato a mano nella
documentazione riportava 1.187,32 € invece di 1.187,33 €. Il test falliva per un centesimo. Il
codice aveva ragione e il documento è stato corretto.

---

## D8 — La soglia di esenzione comunale è una soglia, non una franchigia

**Decisione.** Superati i 23.000 € di imponibile, l'addizionale comunale di Milano si applica
sull'intero reddito.

**Alternative scartate.** Applicarla sulla sola eccedenza, che è l'interpretazione intuitiva.

**Perché.** È la meccanica prevista dalla norma, confermata dalla formulazione esplicita usata dai
comuni. Trattarla come franchigia produrrebbe un errore di circa 184 € l'anno su ogni reddito sopra
soglia: piccolo, costante e invisibile a occhio.

**Conseguenza.** È l'unico punto in cui il nostro risultato si discosta dal calcolatore pubblico
usato per la validazione — che non modella la soglia. L'analisi è in `validazione.md`.

---

## D9 — Font di sistema invece di next/font/google

**Decisione.** Nessun font remoto.

**Perché.** Elimina una dipendenza di rete in fase di build e rende il progetto compilabile
offline. Su un prototipo, una dipendenza esterna in meno è un punto di rottura in meno.

---

## D10 — Nessun backend

**Decisione.** Il calcolo avviene interamente nel browser; la pagina è statica.

**Alternative scartate.** Esporre il motore dietro un endpoint API.

**Perché.** Non c'è nulla da proteggere né da persistere: il motore è deterministico e i parametri
sono pubblici. Un backend avrebbe aggiunto superficie operativa senza aggiungere valore. Se un
giorno servisse — per versionare i parametri o servire più clienti — il motore è già isolato e
riutilizzabile così com'è.
