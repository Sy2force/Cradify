import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CreditCard, 
  Shield, 
  Zap, 
  Users, 
  Star,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Globe,
  Smartphone,
  Palette
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import type { PageProps } from '@/types';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  label: string;
  value: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export default function HomePage({ className }: PageProps = {}) {
  const { user } = useAuth();

  const features: Feature[] = [
    {
      icon: CreditCard,
      title: 'Design Professionnel',
      description: 'Créez des cartes de visite modernes avec notre interface intuitive inspirée d\'Apple et Tesla.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Sécurité Avancée',
      description: 'Authentification JWT, protection des données et conformité aux standards de sécurité.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Performance Ultra-Rapide',
      description: 'Interface fluide et réactive avec des animations Framer Motion pour une expérience premium.',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Users,
      title: 'Collaboration Simple',
      description: 'Partagez vos cartes, gérez votre réseau professionnel et développez votre business.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Globe,
      title: 'Accessibilité Globale',
      description: 'Partagez vos cartes partout dans le monde avec des liens courts et des QR codes.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Optimisé pour tous les appareils avec un design responsive et une PWA intégrée.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Palette,
      title: 'Personnalisation',
      description: 'Thèmes personnalisables, couleurs illimitées et templates professionnels.',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Avancées',
      description: 'Suivez les performances de vos cartes avec des statistiques détaillées.',
      color: 'from-amber-500 to-orange-500'
    },
  ];

  const stats: Stat[] = [
    { label: 'Utilisateurs Actifs', value: '10K+' },
    { label: 'Cartes Créées', value: '50K+' },
    { label: 'Entreprises', value: '1K+' },
    { label: 'Satisfaction', value: '99%' },
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Martin',
      role: 'CEO, TechStart',
      content: 'Cardify a révolutionné notre façon de présenter notre entreprise. Le design est époustouflant et l\'interface intuitive.',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Martin&background=3b82f6&color=ffffff&size=120',
      rating: 5
    },
    {
      name: 'Thomas Dubois',
      role: 'Designer, CreativeStudio',
      content: 'L\'interface est d\'une élégance rare. Mes clients adorent mes nouvelles cartes professionnelles. Un outil indispensable.',
      avatar: 'https://ui-avatars.com/api/?name=Thomas+Dubois&background=8b5cf6&color=ffffff&size=120',
      rating: 5
    },
    {
      name: 'Marie Lefebvre',
      role: 'Consultante Marketing',
      content: 'Simplicité, beauté et efficacité. Cardify coche toutes les cases pour un outil professionnel moderne.',
      avatar: 'https://ui-avatars.com/api/?name=Marie+Lefebvre&background=10b981&color=ffffff&size=120',
      rating: 5
    },
  ];

  const benefits: string[] = [
    'Création en 2 minutes',
    'Templates professionnels',
    'Partage instantané',
    'Analytics en temps réel',
    'Support 24/7',
    'Mises à jour gratuites'
  ];

  return (
    <div className={`min-h-screen bg-gradient-hero dark:bg-gradient-to-br dark:from-dark-50 dark:via-dark-100 dark:to-dark-200 ${className || ''}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden section-padding">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delay-1" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float-delay-2" />
        </div>

        <div className="relative container-cardify">
          <div className="text-center">
            {/* Hero Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full border border-primary-200 dark:border-primary-800 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Nouvelle génération de cartes de visite
              </span>
            </motion.div>

            {/* Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-responsive-xl font-bold text-gray-900 dark:text-white mb-6"
            >
              <span className="block">Cartes de Visite</span>
              <span className="block text-gradient">
                Nouvelle Génération
              </span>
            </motion.h1>

            {/* Hero Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Créez, partagez et gérez vos cartes de visite professionnelles avec une expérience 
              utilisateur inspirée d'Apple et Tesla. Design épuré, sécurité renforcée, performance optimale.
            </motion.p>

            {/* Hero CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              {user ? (
                <>
                  <Link to="/cards">
                    <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />} className="min-w-[200px]">
                      Découvrir les Cartes
                    </Button>
                  </Link>
                  {user.isBusiness && (
                    <Link to="/create-card">
                      <Button size="lg" variant="outline" leftIcon={<CreditCard className="w-5 h-5" />} className="min-w-[200px]">
                        Créer ma Carte
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />} className="min-w-[200px]">
                      Commencer Gratuitement
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="min-w-[200px]">
                      Se Connecter
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t divider"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="text-responsive-md font-bold text-gray-900 dark:text-white mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding glass-effect">
        <div className="container-cardify">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-responsive-lg font-bold text-gray-900 dark:text-white mb-4">
              Pourquoi Choisir Cardify ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Une expérience premium qui combine esthétique moderne, 
              fonctionnalités avancées et sécurité de niveau entreprise.
            </p>
          </motion.div>

          <div className="grid-cardify">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="h-full p-6 card card-hover">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding">
        <div className="container-cardify">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-responsive-lg font-bold text-gray-900 dark:text-white mb-6">
                Tout ce dont vous avez besoin pour réussir
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Cardify réunit tous les outils essentiels pour créer, gérer et partager 
                vos cartes de visite professionnelles en toute simplicité.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-effect rounded-2xl p-8 shadow-cardify-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">+245%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-5/6"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Engagement</span>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">+189%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-3/4"></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Conversion</span>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">+156%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-300 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding glass-effect">
        <div className="container-cardify">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-responsive-lg font-bold text-gray-900 dark:text-white mb-4">
              Ce Que Disent Nos Utilisateurs
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Découvrez pourquoi plus de 10 000 professionnels nous font confiance
            </p>
          </motion.div>

          <div className="grid-cardify-large">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="h-full p-6 card card-hover">
                  {/* Stars */}
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={testimonial.avatar}
                      alt={`Photo de profil de ${testimonial.name}`}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-cardify relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>

        <div className="relative container-cardify text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-responsive-lg font-bold text-white mb-4">
              Prêt à Créer Votre Carte Professionnelle ?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez les milliers de professionnels qui ont déjà adopté Cardify. 
              Inscription gratuite, résultat immédiat.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user && (
                <>
                  <Link to="/register">
                    <Button 
                      size="lg" 
                      variant="secondary"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="bg-white text-primary-600 hover:bg-gray-50 min-w-[200px]"
                    >
                      Commencer Maintenant
                    </Button>
                  </Link>
                  <Link to="/cards">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-white text-white hover:bg-white/10 min-w-[200px]"
                    >
                      Voir des Exemples
                    </Button>
                  </Link>
                </>
              )}

              {user && !user.isBusiness && (
                <Link to="/register">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    leftIcon={<TrendingUp className="w-5 h-5" />}
                    className="bg-white text-primary-600 hover:bg-gray-50 min-w-[200px]"
                  >
                    Passer à Business
                  </Button>
                </Link>
              )}

              {user && user.isBusiness && (
                <Link to="/create-card">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    leftIcon={<CreditCard className="w-5 h-5" />}
                    className="bg-white text-primary-600 hover:bg-gray-50 min-w-[200px]"
                  >
                    Créer ma Première Carte
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
