# E4 — Validazione contro calcolatori indipendenti

**Data:** 20 agosto 2026 · **Versione del motore:** suite di 38 test verdi

Un test verde prova che il codice fa quello che il test dice, non che il test dica la cosa giusta.
Su un dominio normativo, i test possono essere coerentemente sbagliati. Questa fase rompe la
circolarità confrontando l'output con calcolatori costruiti da altri, su altre assunzioni.

Assunzioni del nostro calcolo: Lombardia, Milano, 14 mensilità, nessun familiare a carico, anno 2026.

---

## Caso 1 — RAL 40.000 €

| Voce | Nostro motore | CalcoloNetto.it | Scostamento |
|---|---|---|---|
| Contributi INPS | 3.676,00 | 3.676 | 0 |
| IRPEF lorda | 9.186,92 | 9.187 | arrotondamento |
| Detrazioni totali | 1.646,83 | 1.647 | arrotondamento |
| Addizionali | 823,66 | 824 | arrotondamento |
| **Netto annuo** | **27.960,25** | **27.960** | **0** |
| Netto mensile (14) | 1.997,16 | 1.997 | 0 |

**Esito: coincidenza voce per voce.**

Secondo riscontro sullo stesso caso — *StipendioNettoCalcolatore.it*: contributi 3.676 €, IRPEF netta
7.540 €, entrambi identici ai nostri. Il loro netto annuo è 28.784 € contro i nostri 27.960,25 €.
Lo scostamento di 823,75 € è **interamente spiegato**: quel sito dichiara di escludere le addizionali
locali dal calcolo base, e 823,66 € è esattamente il nostro totale addizionali. Perimetro diverso,
non calcolo diverso.

---

## Caso 2 — RAL 70.000 €

| Voce | Nostro motore | CalcoloNetto.it | Scostamento |
|---|---|---|---|
| Contributi INPS | 6.570,76 | 6.571 | arrotondamento |
| IRPEF netta | 19.474,57 | 19.475 | arrotondamento |
| Addizionali | 1.508,06 | 1.508 | arrotondamento |
| **Netto annuo** | **42.446,61** | **42.447** | **0** |
| Netto mensile (14) | 3.031,90 | 3.032 | 0 |

**Esito: coincidenza voce per voce.** Il caso è significativo perché supera la prima fascia di
retribuzione pensionabile (56.224 €): valida quindi anche l'aliquota aggiuntiva dell'1%, oltre
all'azzeramento della detrazione da lavoro dipendente sopra i 50.000 €.

---

## Caso 3 — RAL 25.000 € — **scostamento reale, e spiegato**

| Voce | Nostro motore | CalcoloNetto.it | Scostamento |
|---|---|---|---|
| Contributi INPS | 2.297,50 | 2.298 | arrotondamento |
| IRPEF lorda | 5.221,58 | 5.222 | arrotondamento |
| Detrazione lavoro dipendente | 2.394,93 | 2.395 | arrotondamento |
| Ulteriore detrazione | 1.000,00 | 1.000 | 0 |
| **Addizionali** | **306,20** | **488** | **−181,80** |
| **Netto annuo** | **20.569,65** | **20.388** | **+181,65** |

### Analisi dello scostamento

Ogni voce coincide tranne le addizionali. Il nostro imponibile fiscale è 22.702,50 €, che sta
**sotto la soglia di esenzione comunale di Milano** (23.000 €): la nostra addizionale comunale è
quindi zero, e i 306,20 € sono solo la regionale lombarda.

Il loro valore di 488 € si ricostruisce esattamente così: 306,20 (regionale) + 22.702,50 × 0,8%
= 306,20 + 181,62 = **487,82 ≈ 488**.

**Conclusione: il calcolatore di riferimento non applica la soglia di esenzione comunale.**
La sua pagina dichiara "Lombardia" ma non indica un comune, e con ogni probabilità applica
un'aliquota comunale indistinta.

### Perché riteniamo corretta la nostra versione

- Il portale del federalismo fiscale del MEF, fonte primaria, riporta per Milano la soglia di
  esenzione a 23.000 € (delibera n. 46/2020, efficace per il 2026).
- La meccanica della soglia — dovuta sull'intero imponibile una volta superata, non sull'eccedenza —
  è confermata dalla formulazione esplicita usata dai comuni per la stessa fattispecie.
- Il nostro prototipo dichiara Milano come assunzione; il calcolatore di confronto no.

Questo è lo scostamento più utile dei tre: mostra che il modello non si limita a replicare la media
degli altri calcolatori, ma implementa una regola locale che gli altri semplificano.

---

## Sintesi

| Caso | Esito |
|---|---|
| RAL 25.000 € | Scostamento di 181,65 €, spiegato: soglia di esenzione comunale non modellata dal riferimento |
| RAL 40.000 € | Coincidenza esatta con un riferimento; scostamento del secondo interamente spiegato dal perimetro |
| RAL 70.000 € | Coincidenza esatta, incluso il tratto oltre la prima fascia pensionabile |

Il criterio di accettazione fissato in fase di discovery — *combaciare con almeno due calcolatori su
tre RAL campione, o spiegare lo scostamento* — è **soddisfatto**.

### Cosa resta non validato

- Nessun confronto su RAL sotto i 20.000 €, dove opera il bonus (somma non imponibile). Il ramo è
  coperto dai test unitari ma non da un riscontro esterno.
- Nessun confronto sopra il massimale contributivo (122.295 €).
- I confronti usano un solo calcolatore che modella le addizionali. Un terzo riferimento che
  permetta di selezionare il comune renderebbe la validazione più solida.

---

## Fonti

- [CalcoloNetto.it — RAL 40k](https://www.calcolonetto.it/stipendio-netto-40k/)
- [CalcoloNetto.it — RAL 25k](https://www.calcolonetto.it/stipendio-netto-25k/)
- [CalcoloNetto.it — RAL 70k](https://www.calcolonetto.it/stipendio-netto-70k/)
- [StipendioNettoCalcolatore.it — RAL 40.000 netto 2026](https://stipendionettocalcolatore.it/ral-40000-netto-2026/)
