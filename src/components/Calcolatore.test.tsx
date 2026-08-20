import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calcolatore from './Calcolatore';

/**
 * Test dell'interfaccia: verificano il comportamento che l'utente osserva,
 * non l'implementazione. La correttezza dei numeri è responsabilità del motore
 * e dei suoi test; qui si controlla che il motore venga invocato e che il
 * risultato arrivi in pagina in modo leggibile.
 */

describe('Calcolatore', () => {
  it('non mostra alcun risultato prima che l\'utente prema Calcola', () => {
    render(<Calcolatore />);
    expect(screen.queryByRole('region', { name: /risultato/i })).not.toBeInTheDocument();
  });

  it('mostra netto annuo e netto mensile dopo il calcolo', async () => {
    const utente = userEvent.setup();
    render(<Calcolatore />);

    await utente.clear(screen.getByLabelText(/retribuzione annua lorda/i));
    await utente.type(screen.getByLabelText(/retribuzione annua lorda/i), '40000');
    await utente.click(screen.getByRole('button', { name: /calcola/i }));

    // "Netto annuo" compare due volte: nel riquadro in evidenza e in fondo alla
    // tabella di dettaglio. Sono entrambe volute.
    expect(screen.getAllByText('Netto annuo')).toHaveLength(2);
    expect(screen.getAllByText(/27\.960/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Netto mensile \(14 mensilità\)/)).toBeInTheDocument();
  });

  it('espone il dettaglio delle trattenute, ciascuna con la propria fonte', async () => {
    const utente = userEvent.setup();
    render(<Calcolatore />);
    await utente.click(screen.getByRole('button', { name: /calcola/i }));

    expect(screen.getByText(/Contributi previdenziali IVS/)).toBeInTheDocument();
    expect(screen.getByText(/IRPEF lorda/)).toBeInTheDocument();
    expect(screen.getByText(/Addizionale regionale Lombardia/)).toBeInTheDocument();
    expect(screen.getByText(/Addizionale comunale Milano/)).toBeInTheDocument();

    const collegamenti = screen.getAllByRole('link');
    expect(collegamenti.length).toBeGreaterThan(3);
    for (const collegamento of collegamenti) {
      expect(collegamento).toHaveAttribute('href', expect.stringMatching(/^https?:\/\//));
    }
  });

  it('ricalcola quando cambia il numero di mensilità', async () => {
    const utente = userEvent.setup();
    render(<Calcolatore />);
    await utente.click(screen.getByRole('button', { name: /calcola/i }));
    expect(screen.getByText(/Netto mensile \(14 mensilità\)/)).toBeInTheDocument();

    await utente.selectOptions(screen.getByLabelText(/mensilità/i), '12');
    await utente.click(screen.getByRole('button', { name: /calcola/i }));
    expect(screen.getByText(/Netto mensile \(12 mensilità\)/)).toBeInTheDocument();
  });

  it('segnala un input non valido senza mostrare risultati', async () => {
    const utente = userEvent.setup();
    render(<Calcolatore />);

    await utente.clear(screen.getByLabelText(/retribuzione annua lorda/i));
    await utente.type(screen.getByLabelText(/retribuzione annua lorda/i), 'abc');
    await utente.click(screen.getByRole('button', { name: /calcola/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Netto annuo')).not.toBeInTheDocument();
  });

  it('dichiara in pagina le assunzioni su cui il calcolo si regge', async () => {
    const utente = userEvent.setup();
    render(<Calcolatore />);
    await utente.click(screen.getByRole('button', { name: /calcola/i }));

    expect(screen.getByText(/Assunzioni e semplificazioni/i)).toBeInTheDocument();
    expect(screen.getByText(/Nessun familiare a carico/i)).toBeInTheDocument();
  });
});
