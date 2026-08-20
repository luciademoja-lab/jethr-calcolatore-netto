# JetHR — Calcolatore RAL → Netto
## Documento di discovery

**Autrice:** Lucia De Mojà · **Data:** 20 agosto 2026 · **Stato:** discovery chiusa, in attesa di validazione normativa

> **Nota di lettura.** In questo documento ogni affermazione è etichettata come
> **[verificato]** (controllato su fonte primaria in questa fase),
> **[da verificare]** (plausibile ma non ancora confrontato con la fonte),
> **[decisione]** (scelta di prodotto, non un fatto).
> Nessun parametro numerico è ancora **[verificato]**: la ricerca normativa è la fase successiva.

---

## 1. Cosa ci viene chiesto

Un prototipo web che, data una retribuzione annua lorda (RAL), restituisca il netto annuo, il netto mensile e l'elenco di tutte le voci trattenute dal lordo.

I criteri di valutazione dichiarati nella traccia sono tre: capacità di ricerca su fonti rilevanti, capacità di strutturare le informazioni in una soluzione, capacità di costruire un prototipo funzionante.

Esiste però un quarto criterio, dichiarato in modo enfatico: *«lo scopo del test non è capire quanto sei bravo ad usare lovable ma verificare che hai costruito qualcosa di cui hai capito le logiche e di cui sei in controllo»*.

**Interpretazione che guida tutte le scelte seguenti.** Il deliverable competitivo non è il calcolatore — quello è la soglia d'ingresso. Il deliverable competitivo è la **tracciabilità**: ogni numero prodotto dal software deve essere riconducibile a una fonte normativa citata, e ogni semplificazione deve essere una decisione scritta, motivata e quantificata nel suo impatto. La traccia dice esplicitamente che le semplificazioni saranno oggetto di discussione all'interview: quindi le semplificazioni sono materiale d'esame da esibire, non debito da nascondere.

---

## 2. Perimetro

### 2.1 Dentro il perimetro

| Elemento | Scelta |
|---|---|
| Input utente | RAL annua lorda; numero di mensilità (12 / 13 / 14) |
| Output | Netto annuo, netto mensile, elenco voce per voce delle trattenute |
| Ogni voce | Importo + riferimento normativo consultabile |
| Anno d'imposta | 2026 |
| Profilo lavoratore | Impiegato, tempo indeterminato, full time, CCNL Terziario/Commercio, residente e domiciliato a Milano, nessuna agevolazione |

### 2.2 Fuori dal perimetro (e perché)

Ogni riga qui sotto è una **[decisione]** consapevole, non una dimenticanza.

| Escluso | Motivo | Impatto sul risultato |
|---|---|---|
| Familiari a carico e relative detrazioni | La traccia autorizza il caso standard; le detrazioni per carichi di famiglia introducono una casistica ampia (coniuge, figli per fascia d'età, altri familiari) che moltiplicherebbe i rami da testare senza aggiungere valore dimostrativo | Il netto calcolato è il **minimo** per quella RAL: un dipendente con carichi di famiglia prende di più |
| Altre regioni e comuni | Le addizionali comunali sono deliberate da ~8.000 comuni con aliquote e soglie di esenzione proprie: è un problema di raccolta dati, non di logica | Nessuno sul caso Milano; il modello è predisposto per accogliere altri enti (vedi §4) |
| Detrazioni per oneri (spese sanitarie, mutuo, ecc.) | Sono di competenza della dichiarazione dei redditi, non del cedolino | Nessuno sul netto da cedolino |
| Fringe benefit, welfare, premi di risultato a tassazione agevolata | Fuori dalla nozione di RAL fissa | Nessuno se la RAL è solo retribuzione ordinaria |
| Agevolazioni (impatriati, under 30, decontribuzioni) | Escluse esplicitamente dalla traccia | Nessuno |
| Conguaglio fiscale di fine anno | Il calcolo è una proiezione annuale, non una simulazione mese per mese | Nessuno in proiezione annua; ci sarebbe se simulassimo i singoli cedolini |
| TFR | Non è retribuzione corrente e ha tassazione separata | Nessuno sul netto in busta |
| Contributi a carico azienda | La domanda riguarda il netto del dipendente, non il costo azienda | Nessuno |

**Nota da portare al colloquio.** L'esclusione del TFR e dei contributi a carico azienda non è una semplificazione: è la risposta corretta alla domanda posta. Confondere costo azienda e RAL è l'errore più comune in questo dominio, e la traccia chiede esplicitamente il percorso *dalla RAL* al netto.

---

## 3. La catena di calcolo

Questa è la struttura logica del motore. Le percentuali indicate sono **[da verificare]** — servono qui solo a mostrare la forma del calcolo.

```
RAL (lordo annuo)
  │
  ├─ (1) contributi previdenziali a carico dipendente        [~9,19% IVS + 1% sopra soglia]
  ▼
IMPONIBILE FISCALE
  │
  ├─ (2) IRPEF lorda per scaglioni progressivi
  │
  ├─ (3) − detrazioni da lavoro dipendente (decrescenti col reddito)
  ▼
IRPEF NETTA
  │
  ├─ (4) + addizionale regionale Lombardia
  ├─ (5) + addizionale comunale Milano
  ├─ (6) ± trattamento integrativo / bonus sul reddito da lavoro
  ▼
NETTO ANNUO  →  ÷ mensilità  →  NETTO MENSILE
```

**Ordine dei passaggi: è la parte load-bearing.** Se si sbaglia l'ordine — per esempio applicando l'IRPEF alla RAL invece che all'imponibile al netto dei contributi — l'errore è di alcune migliaia di euro l'anno e il risultato resta comunque *plausibile*. Per questo il punto (1) e la definizione di imponibile fiscale sono il primo test che scriverò, e il primo confronto con le fonti.

**Punti dove il dominio nasconde le trappole** (da chiarire in fase di ricerca):

1. La base imponibile dell'addizionale regionale e comunale coincide con l'imponibile IRPEF, ma le addizionali si calcolano sul reddito complessivo, non sull'IRPEF: sono due grandezze diverse.
2. Le addizionali hanno soglie di esenzione e possono essere a scaglioni proprie, diverse da quelle IRPEF.
3. Le detrazioni da lavoro dipendente non sono un importo fisso: decrescono al crescere del reddito fino ad azzerarsi, con formule diverse per fascia.
4. Il trattamento integrativo ha una soglia di spettanza e un meccanismo di *capienza* legato all'IRPEF lorda e alle detrazioni: sopra una certa RAL non spetta, e nella fascia di transizione è parziale.
5. Le addizionali di un anno si versano in acconto e saldo su anni diversi: in una proiezione annuale questo si trascura, ma va dichiarato.

---

## 4. Come struttureremo la soluzione

**[decisione] Separazione netta tra parametri e logica.** Aliquote, scaglioni, soglie e detrazioni vivono in un file di configurazione dedicato all'anno d'imposta, ciascuno con il proprio riferimento normativo accanto al valore. La logica di calcolo non contiene numeri letterali.

Questo serve a tre cose, in ordine di importanza:

1. **Difendibilità.** Al colloquio posso aprire un solo file e mostrare ogni parametro con la sua fonte. Non devo cercare un numero dentro il codice.
2. **Manutenibilità reale.** Ogni legge di bilancio cambia questi valori. In un prodotto vero, l'aggiornamento annuale deve essere una modifica di dati, non di codice.
3. **Estensibilità.** Aggiungere un altro comune o un altro anno diventa aggiungere una riga di configurazione, non riscrivere il motore. È la ragione per cui l'esclusione di §2.2 non è un vicolo cieco.

**[decisione] Il motore di calcolo è puro e indipendente dall'interfaccia.** Funzioni senza stato, input → output, testabili senza browser. L'interfaccia è un consumatore del motore. Questo permette il TDD vero sul pezzo che conta e rende il codice leggibile a chi lo revisiona.

**[decisione] Il risultato è un oggetto strutturato, non un numero.** Il motore restituisce l'intera scomposizione (ogni voce con importo, base di calcolo e fonte), non solo il netto. La pagina si limita a renderizzare quella struttura. Conseguenza pratica: la trasparenza richiesta dalla traccia è una proprietà del modello dati, non un abbellimento dell'interfaccia.

**Stack:** Next.js + TypeScript, test con Vitest, deploy su Vercel.
TypeScript non è decorativo qui: i tipi rendono espliciti concetti che in questo dominio si confondono facilmente (RAL ≠ imponibile fiscale ≠ reddito complessivo ≠ netto). Un tipo sbagliato diventa un errore di compilazione invece di un numero plausibile.

---

## 5. Criteri di accettazione

**Definition of done per ogni feature** (in quest'ordine, nessun passo saltabile):

1. Test scritto prima dell'implementazione, e fallisce per il motivo giusto.
2. Implementazione minima che fa passare il test.
3. Ogni parametro numerico introdotto ha la sua fonte citata nella configurazione.
4. Documentazione aggiornata contestualmente, non alla fine.
5. Commit atomico con messaggio che dice *cosa* e *perché*.

**Definition of done del prodotto:**

- L'output combacia con almeno due calcolatori pubblici di riferimento su tre RAL campione (es. 25.000, 40.000, 70.000 €), oppure lo scostamento è spiegato e ricondotto a una semplificazione dichiarata.
- Il README elenca ogni assunzione con motivazione e impatto.
- Il sito è online su Vercel e funziona da mobile.

**Perché il confronto esterno è un criterio di accettazione e non un extra.** Un test verde prova che il codice fa quello che il test dice, non che il test dica la cosa giusta. Su un dominio normativo che non conosco a memoria, i miei test possono essere coerentemente sbagliati. Il confronto con calcolatori indipendenti è l'unico controllo che rompe questa circolarità.

---

## 6. Rischi

| # | Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|---|
| 1 | Il calcolatore produce un numero **plausibile ma sbagliato** e viene difeso al colloquio come corretto | Media | Molto alto — distrugge il criterio «sei in controllo» | Validazione esterna come criterio di accettazione (§5); nessun parametro senza fonte |
| 2 | Parametri 2026 non ancora pubblicati o provvisori (in particolare la delibera comunale) | Media | Medio | Verifica in fase di ricerca; se un dato manca, si dichiara in pagina e si usa l'ultimo disponibile motivandolo |
| 3 | Scope creep: aggiungere input e casistiche "perché sarebbe bello" | Alta | Medio — diluisce la qualità dove conta | Perimetro congelato in §2; ogni aggiunta richiede una riga nel decision log |
| 4 | Fonti secondarie (blog di consulenti, siti di news) al posto delle primarie | Media | Alto — è esattamente il criterio n.1 della traccia | Solo Agenzia delle Entrate, INPS, Gazzetta Ufficiale, delibere comunali, testo CCNL |
| 5 | Bella interfaccia, motore fragile | Media | Alto | TDD sul motore prima di toccare l'interfaccia; UI solo dopo motore verde e validato |

Il rischio 1 è quello che governa il piano. Tutto il resto è ordinaria amministrazione.

---

## 7. Piano delle epic (proposta)

| Epic | Contenuto | Esito osservabile |
|---|---|---|
| **E1 — Ricerca normativa** | Reperimento e citazione dei parametri 2026 su fonti primarie | Tabella parametri con link, pronta a diventare configurazione |
| **E2 — Modello dominio e configurazione** | Tipi del dominio, file parametri anno 2026 con fonti | Il dominio è espresso nei tipi; nessun numero nel codice |
| **E3 — Motore di calcolo (TDD)** | Contributi → imponibile → IRPEF → detrazioni → addizionali → trattamento integrativo | Suite verde; output strutturato completo |
| **E4 — Validazione esterna** | Confronto con calcolatori pubblici su RAL campione | Tabella di confronto con scostamenti spiegati |
| **E5 — Interfaccia** | Form input, bottone calcola, breakdown voce per voce con fonti | Pagina funzionante e leggibile da mobile |
| **E6 — Documentazione** | README con assunzioni, decision log, istruzioni | Un revisore capisce le scelte senza leggere il codice |
| **E7 — Deploy** | Vercel, verifica in produzione | Link pubblico funzionante |

**Ordine non negoziabile: E1 → E2 → E3 → E4 prima di E5.** L'interfaccia si costruisce su un motore già validato. Costruire la pagina prima del motore è l'errore che la traccia sta esplicitamente cercando di intercettare.

---

## 8. Cosa serve decidere ancora

Nulla di bloccante. Due punti da chiudere durante E1, con evidenza alla mano:

- Se la delibera comunale di Milano per il 2026 non fosse ancora pubblicata, si usa l'ultima vigente dichiarandolo in pagina.
- Se l'aliquota contributiva del CCNL Terziario dipendesse da parametri aziendali (dimensione dell'azienda, fondi integrativi), si sceglie il caso più comune e lo si dichiara.
