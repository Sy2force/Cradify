import { Card } from '../types';

export interface ExportData {
  cards: Card[];
  exportDate: string;
  version: string;
}

export function exportCardsToJSON(cards: Card[]): void {
  const exportData: ExportData = {
    cards,
    exportDate: new Date().toISOString(),
    version: '1.0.0'
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cardify-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCardsToCSV(cards: Card[]): void {
  const headers = [
    'Titre',
    'Sous-titre',
    'Description',
    'Email',
    'Téléphone',
    'Site Web',
    'Pays',
    'Ville',
    'Rue',
    'Numéro',
    'Code Postal',
    'Likes',
    'Date de création'
  ];

  const csvContent = [
    headers.join(','),
    ...cards.map(card => [
      `"${card.title}"`,
      `"${card.subtitle}"`,
      `"${card.description}"`,
      `"${card.email}"`,
      `"${card.phone}"`,
      `"${card.web || ''}"`,
      `"${card.address.country}"`,
      `"${card.address.city}"`,
      `"${card.address.street}"`,
      card.address.houseNumber,
      card.address.zip || '',
      card.likes,
      `"${new Date(card.createdAt).toLocaleDateString('fr-FR')}"`
    ].join(','))
  ].join('\n');

  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cardify-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateCardQRCode(cardId: string): string {
  const cardUrl = `${window.location.origin}/cards/${cardId}`;
  // Using a public QR code API - in production you'd want to use a more reliable service
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cardUrl)}`;
}

export function shareCard(card: Card): void {
  const cardUrl = `${window.location.origin}/cards/${card._id}`;
  const shareData = {
    title: `Carte de ${card.title}`,
    text: `Découvrez la carte de visite de ${card.title} - ${card.subtitle}`,
    url: cardUrl
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {
      // Share failed, fallback to clipboard
      navigator.clipboard.writeText(cardUrl);
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(cardUrl);
  }
}

export function parseImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as ExportData;
        
        // Validate the imported data structure
        if (!data.cards || !Array.isArray(data.cards)) {
          throw new Error('Format de fichier invalide: propriété "cards" manquante ou invalide');
        }

        // Basic validation of each card
        data.cards.forEach((card, index) => {
          if (!card.title || !card.email || !card.phone) {
            throw new Error(`Carte ${index + 1}: champs obligatoires manquants (titre, email, téléphone)`);
          }
        });

        resolve(data);
      } catch (error) {
        reject(new Error(`Erreur lors de l'analyse du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsText(file);
  });
}
