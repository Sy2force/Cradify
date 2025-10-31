import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiService } from '../lib/api';
import { exportCardsToJSON, exportCardsToCSV, parseImportFile, ExportData } from '../utils/cardExport';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  AlertCircle,
  CheckCircle,
  QrCode,
  Share2
} from 'lucide-react';
import { Card as CardType } from '../types';

export function ExportImportPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);
  const [userCards, setUserCards] = useState<CardType[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const loadUserCards = async () => {
    if (!user) return;
    
    try {
      setLoadingCards(true);
      const response = await apiService.getCards();
      setUserCards(response || []);
    } catch {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de charger vos cartes'
      });
    } finally {
      setLoadingCards(false);
    }
  };

  const handleExportJSON = async () => {
    await loadUserCards();
    if (userCards.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Aucune carte à exporter',
        message: 'Vous devez avoir au moins une carte pour l\'export'
      });
      return;
    }

    exportCardsToJSON(userCards);
    addNotification({
      type: 'success',
      title: 'Export réussi',
      message: `${userCards.length} cartes exportées au format JSON`
    });
  };

  const handleExportCSV = async () => {
    await loadUserCards();
    if (userCards.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Aucune carte à exporter',
        message: 'Vous devez avoir au moins une carte pour l\'export'
      });
      return;
    }

    exportCardsToCSV(userCards);
    addNotification({
      type: 'success',
      title: 'Export réussi',
      message: `${userCards.length} cartes exportées au format CSV`
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImportResults(null);

    try {
      const importData: ExportData = await parseImportFile(file);
      const results = { success: 0, errors: [] as string[] };

      for (const [index, cardData] of importData.cards.entries()) {
        try {
          await apiService.createCard({
            title: cardData.title,
            subtitle: cardData.subtitle,
            description: cardData.description,
            email: cardData.email,
            phone: cardData.phone,
            web: cardData.web || '',
            country: cardData.address?.country || 'France',
            city: cardData.address?.city || 'Paris',
            street: cardData.address?.street || 'Rue Example',
            houseNumber: parseInt(cardData.address?.houseNumber?.toString() || '1'),
            zip: parseInt(cardData.address?.zip?.toString() || '75001')
          });
          results.success++;
        } catch (error) {
          results.errors.push(`Carte ${index + 1} (${cardData.title}): ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      }

      setImportResults(results);
      
      if (results.success > 0) {
        addNotification({
          type: 'success',
          title: 'Import terminé',
          message: `${results.success} cartes importées avec succès`
        });
      }

      if (results.errors.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Import partiel',
          message: `${results.errors.length} erreurs lors de l'import`
        });
      }

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur d\'import',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            📦 Export & Import
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Gérez vos données et partagez vos cartes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <Card className="p-8">
            <div className="text-center mb-6">
              <Download className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Exporter vos cartes
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sauvegardez toutes vos cartes dans différents formats
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleExportJSON}
                disabled={loadingCards}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {loadingCards ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FileJson className="w-5 h-5" />
                )}
                Exporter en JSON
              </Button>

              <Button
                onClick={handleExportCSV}
                disabled={loadingCards}
                variant="outline"
                className="w-full flex items-center justify-center gap-3"
              >
                {loadingCards ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5" />
                )}
                Exporter en CSV
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Formats disponibles :
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>JSON</strong> : Format complet avec toutes les données</li>
                <li>• <strong>CSV</strong> : Format tabulaire pour Excel/Sheets</li>
              </ul>
            </div>
          </Card>

          {/* Import Section */}
          <Card className="p-8">
            <div className="text-center mb-6">
              <Upload className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Importer des cartes
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Importez des cartes depuis un fichier JSON
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  id="import-file"
                  aria-label="Choisir un fichier JSON à importer"
                />
                <Button
                  variant="outline"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 border-dashed border-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  Choisir un fichier JSON
                </Button>
              </div>
            </div>

            {importResults && (
              <div className="mt-6 space-y-3">
                {importResults.success > 0 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{importResults.success} cartes importées</span>
                  </div>
                )}
                
                {importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <span>{importResults.errors.length} erreurs :</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                      {importResults.errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-700 dark:text-red-300">
                          • {error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ Important :
              </h3>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Seuls les fichiers JSON sont acceptés</li>
                <li>• Les cartes dupliquées ne seront pas importées</li>
                <li>• Vérifiez vos données avant l'import</li>
              </ul>
            </div>
          </Card>
        </div>

        {/* Additional Tools */}
        <Card className="mt-8 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🔧 Outils supplémentaires
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <QrCode className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Codes QR
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Générez des codes QR pour vos cartes lors de l'export
              </p>
            </div>

            <div className="text-center">
              <Share2 className="w-12 h-12 mx-auto text-orange-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Partage direct
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Partagez vos cartes via URL ou réseaux sociaux
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
