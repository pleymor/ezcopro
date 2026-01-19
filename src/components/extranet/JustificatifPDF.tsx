'use client';

import { useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMontant, formatDate } from '@/hooks/useExtranetSolde';
import type { PaiementExtranet } from '@/hooks/useExtranetPaiements';

interface JustificatifPDFProps {
  paiement: PaiementExtranet;
  coproprietaireNom: string;
  coproprieteNom: string;
}

/**
 * Composant pour générer un justificatif de paiement.
 * Utilise l'impression du navigateur pour générer un PDF.
 */
export function JustificatifPDF({
  paiement,
  coproprietaireNom,
  coproprieteNom,
}: JustificatifPDFProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = contentRef.current;
    if (!content) return;

    // Ouvrir une fenêtre d'impression avec le contenu
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour télécharger le justificatif.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Justificatif de paiement - ${formatDate(paiement.datePaiement)}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .header p {
              color: #666;
            }
            .info-section {
              margin-bottom: 30px;
            }
            .info-section h2 {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              color: #666;
            }
            .info-value {
              font-weight: 500;
            }
            .amount {
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Justificatif de paiement</h1>
            <p>${coproprieteNom}</p>
          </div>

          <div class="amount">
            ${formatMontant(paiement.montantCents)}
          </div>

          <div class="info-section">
            <h2>Informations du paiement</h2>
            <div class="info-row">
              <span class="info-label">Date du paiement</span>
              <span class="info-value">${formatDate(paiement.datePaiement)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Référence</span>
              <span class="info-value">${paiement.reference || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Identifiant</span>
              <span class="info-value" style="font-family: monospace;">${paiement.id}</span>
            </div>
          </div>

          <div class="info-section">
            <h2>Copropriétaire</h2>
            <div class="info-row">
              <span class="info-label">Nom</span>
              <span class="info-value">${coproprietaireNom}</span>
            </div>
          </div>

          <div class="info-section">
            <h2>Copropriété</h2>
            <div class="info-row">
              <span class="info-label">Nom</span>
              <span class="info-value">${coproprieteNom}</span>
            </div>
          </div>

          <div class="footer">
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            <p>Ce document est un justificatif de paiement généré automatiquement par EzCopro.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Attendre que le contenu soit chargé puis imprimer
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Download className="h-4 w-4 mr-2" />
      Justificatif
    </Button>
  );
}

/**
 * Bouton pour télécharger tous les justificatifs d'une période
 */
interface JustificatifMultiplePDFProps {
  paiements: PaiementExtranet[];
  coproprietaireNom: string;
  coproprieteNom: string;
  periodLabel?: string;
}

export function JustificatifMultiplePDF({
  paiements,
  coproprietaireNom,
  coproprieteNom,
  periodLabel = 'Période sélectionnée',
}: JustificatifMultiplePDFProps) {
  const handlePrint = () => {
    if (paiements.length === 0) {
      alert('Aucun paiement à exporter.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour télécharger le justificatif.');
      return;
    }

    const totalMontant = paiements.reduce((sum, p) => sum + p.montantCents, 0);

    const paiementsRows = paiements
      .map(
        (p) => `
        <tr>
          <td>${formatDate(p.datePaiement)}</td>
          <td>${p.reference || '-'}</td>
          <td style="text-align: right;">${formatMontant(p.montantCents)}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Récapitulatif des paiements - ${periodLabel}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            .header p {
              color: #666;
            }
            .info-section {
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background: #f5f5f5;
              font-weight: 600;
            }
            .total-row {
              font-weight: bold;
              background: #f5f5f5;
            }
            .total-row td {
              border-top: 2px solid #333;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Récapitulatif des paiements</h1>
            <p>${coproprieteNom}</p>
            <p style="margin-top: 10px; font-weight: 500;">${periodLabel}</p>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span>Copropriétaire</span>
              <span><strong>${coproprietaireNom}</strong></span>
            </div>
            <div class="info-row">
              <span>Nombre de paiements</span>
              <span><strong>${paiements.length}</strong></span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Référence</th>
                <th style="text-align: right;">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${paiementsRows}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td style="text-align: right;">${formatMontant(totalMontant)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            <p>Ce document est un récapitulatif généré automatiquement par EzCopro.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Button variant="outline" onClick={handlePrint} disabled={paiements.length === 0}>
      <Printer className="h-4 w-4 mr-2" />
      Exporter en PDF ({paiements.length})
    </Button>
  );
}
