import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Edit, Trash2, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { cn, formatFullName, getRandomGradient, truncateText } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { cardService } from '@/services/api';
import type { Card as CardType } from '@/types';
import Button from './Button';

interface CardProps {
  card?: CardType;
  onLike?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  isOwner?: boolean;
  variant?: 'vertical' | 'horizontal';
  className?: string;
  children?: React.ReactNode;
}

export function Card({
  card,
  onEdit,
  onDelete,
  onLike,
  showActions = true,
  isOwner: isOwnerProp = false,
  className,
  children,
}: CardProps): JSX.Element {
  const { user } = useAuth();
  
  // If children are provided, render as a wrapper component
  if (children && !card) {
    return (
      <div className={cn("bg-white rounded-lg shadow-md border", className)}>
        {children}
      </div>
    );
  }
  
  // Ensure card is defined for the rest of the component
  if (!card) {
    return <div>No card data provided</div>;
  }
  
  const [isLiking, setIsLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(card.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    user ? card.likes?.includes(user._id) : false
  );

  const isOwnerComputed = user && (
    (typeof card.user_id === 'string' && card.user_id === user._id) ||
    (typeof card.user_id === 'object' && card.user_id._id === user._id)
  );
  
  const isOwner = isOwnerProp || isOwnerComputed;
  
  const canEdit = isOwner || user?.role === 'admin' || user?.isAdmin;

  const handleLike = async () => {
    if (!user || isLiking) return;

    try {
      setIsLiking(true);
      const updatedCard = await cardService.toggleLike(card._id);
      
      setLikesCount(updatedCard.likes?.length || 0);
      setIsLiked(updatedCard.likes?.includes(user._id) || false);
      
      if (onLike) {
        onLike();
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      onDelete();
    }
  };

  const cardAuthor = typeof card.user_id === 'object' ? card.user_id : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-dark-100/80 backdrop-blur-md border border-gray-200/50 dark:border-dark-300/50 shadow-lg hover:shadow-xl transition-all duration-300',
        className
      )}
    >
      {/* Gradient Background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300',
        getRandomGradient(0)
      )} />

      {/* Card Header */}
      <div className="relative p-6 pb-4">
        {/* Business Number Badge */}
        <div className="absolute top-4 right-4">
          <div className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full">
            #{card.bizNumber}
          </div>
        </div>

        {/* Company Info */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
            {card.title}
          </h3>
          
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
            {card.subtitle}
          </p>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {truncateText(card.description, 120)}
          </p>
        </div>

        {/* Author Info */}
        {cardAuthor && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-300">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Créée par{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {formatFullName(cardAuthor.name)}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="px-6 pb-4 space-y-3">
        {/* Phone */}
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <Phone size={16} className="text-primary-500" />
          <span>{card.phone}</span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <Mail size={16} className="text-primary-500" />
          <span className="truncate">{card.email}</span>
        </div>

        {/* Website */}
        {card.web && (
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <Globe size={16} className="text-primary-500" />
            <a
              href={card.web}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline truncate"
              title={`Visiter ${card.web}`}
              aria-label={`Visiter le site web ${card.web}`}
            >
              {card.web.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
          <MapPin size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
          <span className="leading-relaxed">
            {card.address.houseNumber} {card.address.street}, {card.address.city} {card.address.zip}, {card.address.country}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 pb-6 flex items-center justify-between">
          {/* Like Button */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              disabled={!user || isLiking}
              title={isLiked ? 'Retirer le j\'aime' : 'J\'aime cette carte'}
              aria-label={isLiked ? 'Retirer le j\'aime' : 'J\'aime cette carte'}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                isLiked
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300',
                !user && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Heart
                size={16}
                className={cn(
                  'transition-colors duration-200',
                  isLiked ? 'fill-current' : ''
                )}
              />
              <span>{likesCount}</span>
            </motion.button>
          </div>

          {/* Edit/Delete Actions */}
          {canEdit && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                leftIcon={<Edit size={16} />}
              >
                Modifier
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                leftIcon={<Trash2 size={16} />}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                Supprimer
              </Button>
            </div>
          )}

          {/* External Link */}
          {card.web && (
            <a
              href={card.web}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visiter ${card.web}`}
              aria-label={`Visiter le site web ${card.web}`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <ExternalLink size={16} />
              <span>Visiter</span>
            </a>
          )}
        </div>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl" />
    </motion.div>
  );
}

export default Card;
