const mongoose = require('../backend/node_modules/mongoose');
const bcrypt = require('../backend/node_modules/bcryptjs');
const config = require('../backend/src/config');

// Modèle User simplifié pour le script
const userSchema = new mongoose.Schema({
  name: {
    first: { type: String, required: true },
    last: { type: String, required: true }
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isBusiness: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connexion à MongoDB
    const dbConfig = config.getDatabaseConfig();
    await mongoose.connect(dbConfig.uri);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@cardify.com' });
    if (existingAdmin) {
      console.log('⚠️ L\'utilisateur admin existe déjà');
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('✅ Utilisateur mis à jour en tant qu\'administrateur');
      }
      return;
    }

    // Créer un nouveau compte admin
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    const adminUser = new User({
      name: {
        first: 'Super',
        last: 'Admin'
      },
      email: 'admin@cardify.com',
      password: hashedPassword,
      isBusiness: true,
      isActive: true,
      isAdmin: true
    });

    await adminUser.save();
    console.log('✅ Utilisateur administrateur créé avec succès');
    console.log('📧 Email: admin@cardify.com');
    console.log('🔑 Mot de passe: Admin123!');
    console.log('🛡️ Privilèges: Administrateur + Business');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
}

// Exécuter le script
createAdminUser();
