#!/usr/bin/env node

/**
 * 🗄️ Script de Backup Automatique - Cardify
 * Auteur: Shaya Coca
 * Description: Sauvegarde automatique de la base de données MongoDB
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration
const config = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cardify',
  backupDir: path.join(__dirname, '../backups'),
  maxBackups: 7, // Garder 7 dernières sauvegardes
  compressionLevel: 6
};

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.magenta}🗄️  ${msg}${colors.reset}`)
};

/**
 * Créer le dossier de sauvegarde s'il n'existe pas
 */
async function ensureBackupDirectory() {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    log.info(`Dossier de sauvegarde créé: ${config.backupDir}`);
  }
}

/**
 * Générer un nom de fichier de sauvegarde avec timestamp
 */
function generateBackupFilename() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `cardify-backup-${timestamp}.gz`;
}

/**
 * Effectuer la sauvegarde MongoDB avec mongodump
 */
async function createMongoBackup() {
  try {
    log.info('Démarrage de la sauvegarde MongoDB...');
    
    const backupFilename = generateBackupFilename();
    const backupPath = path.join(config.backupDir, backupFilename);
    
    // Extraire le nom de la base de données de l'URI
    const dbName = config.mongoUri.split('/').pop().split('?')[0];
    
    // Commande mongodump avec compression
    const command = `mongodump --uri="${config.mongoUri}" --gzip --archive="${backupPath}"`;
    
    log.info(`Exécution: mongodump pour la base ${dbName}`);
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('done dumping')) {
      throw new Error(stderr);
    }
    
    // Vérifier que le fichier a été créé
    if (fs.existsSync(backupPath)) {
      const stats = fs.statSync(backupPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      log.success(`Sauvegarde créée: ${backupFilename} (${sizeInMB} MB)`);
      return backupPath;
    } else {
      throw new Error('Le fichier de sauvegarde n\'a pas été créé');
    }
    
  } catch (error) {
    log.error(`Erreur lors de la sauvegarde: ${error.message}`);
    throw error;
  }
}

/**
 * Vérifier la connectivité à MongoDB
 */
async function testMongoConnection() {
  try {
    log.info('Test de connexion à MongoDB...');
    
    const client = new MongoClient(config.mongoUri);
    await client.connect();
    
    const admin = client.db().admin();
    const result = await admin.ping();
    
    await client.close();
    
    if (result.ok === 1) {
      log.success('Connexion MongoDB établie');
      return true;
    } else {
      throw new Error('Ping MongoDB échoué');
    }
    
  } catch (error) {
    log.error(`Erreur de connexion MongoDB: ${error.message}`);
    return false;
  }
}

/**
 * Nettoyer les anciennes sauvegardes
 */
async function cleanOldBackups() {
  try {
    log.info('Nettoyage des anciennes sauvegardes...');
    
    const files = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('cardify-backup-') && file.endsWith('.gz'))
      .map(file => ({
        name: file,
        path: path.join(config.backupDir, file),
        mtime: fs.statSync(path.join(config.backupDir, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    if (files.length > config.maxBackups) {
      const filesToDelete = files.slice(config.maxBackups);
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        log.info(`Ancienne sauvegarde supprimée: ${file.name}`);
      }
      
      log.success(`${filesToDelete.length} anciennes sauvegardes supprimées`);
    } else {
      log.info(`${files.length} sauvegardes conservées (limite: ${config.maxBackups})`);
    }
    
  } catch (error) {
    log.warning(`Erreur lors du nettoyage: ${error.message}`);
  }
}

/**
 * Lister les sauvegardes existantes
 */
function listBackups() {
  try {
    log.title('Sauvegardes existantes:');
    
    const files = fs.readdirSync(config.backupDir)
      .filter(file => file.startsWith('cardify-backup-') && file.endsWith('.gz'))
      .map(file => {
        const filePath = path.join(config.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
          date: stats.mtime.toLocaleString()
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (files.length === 0) {
      log.info('Aucune sauvegarde trouvée');
    } else {
      console.table(files);
    }
    
  } catch (error) {
    log.error(`Erreur lors de la liste: ${error.message}`);
  }
}

/**
 * Restaurer une sauvegarde
 */
async function restoreBackup(backupFile) {
  try {
    log.warning(`Restauration de la sauvegarde: ${backupFile}`);
    log.warning('⚠️  Cette opération va écraser la base de données actuelle!');
    
    const backupPath = path.join(config.backupDir, backupFile);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Fichier de sauvegarde non trouvé: ${backupFile}`);
    }
    
    // Commande mongorestore
    const command = `mongorestore --uri="${config.mongoUri}" --gzip --archive="${backupPath}" --drop`;
    
    log.info('Exécution de mongorestore...');
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('done')) {
      throw new Error(stderr);
    }
    
    log.success('Restauration terminée avec succès');
    
  } catch (error) {
    log.error(`Erreur lors de la restauration: ${error.message}`);
    throw error;
  }
}

/**
 * Fonction principale
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  log.title('Script de Backup Cardify - ' + new Date().toLocaleString());
  console.log('='.repeat(50));
  
  try {
    await ensureBackupDirectory();
    
    switch (command) {
      case 'list':
        listBackups();
        break;
        
      case 'restore':
        const backupFile = args[1];
        if (!backupFile) {
          log.error('Usage: node backup.js restore <nom-fichier-backup>');
          process.exit(1);
        }
        await restoreBackup(backupFile);
        break;
        
      case 'test':
        await testMongoConnection();
        break;
        
      default:
        // Sauvegarde par défaut
        const isConnected = await testMongoConnection();
        if (!isConnected) {
          log.error('Impossible de se connecter à MongoDB');
          process.exit(1);
        }
        
        await createMongoBackup();
        await cleanOldBackups();
        
        log.title('Sauvegarde terminée!');
        listBackups();
        break;
    }
    
  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
    process.exit(1);
  }
}

// Gestion des signaux pour un arrêt propre
process.on('SIGINT', () => {
  log.warning('Arrêt du script de sauvegarde...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log.warning('Arrêt du script de sauvegarde...');
  process.exit(0);
});

// Exécution du script
if (require.main === module) {
  main().catch(error => {
    log.error(`Erreur non gérée: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  createMongoBackup,
  testMongoConnection,
  listBackups,
  restoreBackup
};
