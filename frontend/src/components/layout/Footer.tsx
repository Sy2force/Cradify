import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Heart, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 dark:bg-dark-50/80 backdrop-blur-md border-t border-gray-200/50 dark:border-dark-300/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Cardify
              </span>
            </motion.div>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              La plateforme moderne pour créer et partager vos cartes de visite professionnelles. 
              Design élégant, sécurité avancée, expérience utilisateur exceptionnelle.
            </p>
            
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                title="Suivez-nous sur GitHub"
                aria-label="Suivez-nous sur GitHub"
              >
                <Github size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                title="Suivez-nous sur Twitter"
                aria-label="Suivez-nous sur Twitter"
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-500 transition-colors"
                title="Suivez-nous sur LinkedIn"
                aria-label="Suivez-nous sur LinkedIn"
              >
                <Linkedin size={20} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/cards"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  Découvrir les Cartes
                </Link>
              </li>
              <li>
                <Link 
                  to="/register"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  Créer un Compte
                </Link>
              </li>
              <li>
                <Link 
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  Se Connecter
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  Centre d'Aide
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  Documentation API
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  Conditions d'Utilisation
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                >
                  Politique de Confidentialité
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail size={16} className="text-primary-500" />
                <span>contact@cardify.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Phone size={16} className="text-primary-500" />
                <span>+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>Paris, France</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Newsletter
              </h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-3 py-2 text-sm bg-white dark:bg-dark-100 border border-gray-300 dark:border-dark-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-r-lg hover:bg-primary-600 transition-colors"
                >
                  OK
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-dark-300">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>© {currentYear} Cardify.</span>
              <span>Tous droits réservés.</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
              <span>Fait avec</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Heart size={16} className="text-red-500 fill-current" />
              </motion.div>
              <span>par l'équipe Cardify</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-pink-500/10" />
      </div>
    </footer>
  );
}
