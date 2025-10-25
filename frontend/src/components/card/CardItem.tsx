import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/lib/types';
import { 
  Heart, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface CardItemProps {
  card: Card;
  className?: string;
  onEdit?: (cardId: string) => void;
  onDelete?: (cardId: string) => void;
  viewMode?: 'grid' | 'list';
}

export default function CardItem({ 
  card, 
  className, 
  onEdit, 
  onDelete, 
  viewMode = 'grid' 
}: CardItemProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(card.likes.includes(user?._id || ''));
  const [likesCount, setLikesCount] = useState(card.likes.length);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = user?._id === card.user_id;
  const isAdmin = user?.isAdmin;
  const canEdit = isOwner || isAdmin;

  const handleLike = async () => {
    if (!user) {
      toast.error('Connectez-vous pour liker cette carte');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.likeCard(card._id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      // Erreur lors du like
      toast.error('Erreur lors du like');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(card._id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(card._id);
    }
  };

  const cardContent = (
    <>
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-dark-200">
        <img
          src={card.image?.url || 'https://via.placeholder.com/300x200?text=Business+Card'}
          alt={card.image?.alt || card.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={isLoading || !user}
          className={cn(
            'absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200',
            'bg-white/90 dark:bg-dark-200/90 backdrop-blur-sm',
            'hover:bg-white dark:hover:bg-dark-200 hover:scale-110',
            isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
          title={isLiked ? 'Retirer le like' : 'Liker cette carte'}
          aria-label={isLiked ? `Retirer le like de ${card.title}` : `Liker la carte ${card.title}`}
        >
          <Heart 
            size={18} 
            className={cn(
              'transition-all duration-200',
              isLiked && 'fill-current scale-110'
            )} 
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {card.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {card.subtitle}
            </p>
          </div>
          
          {/* Action Buttons */}
          {canEdit && (
            <div className="flex gap-1 ml-2">
              <button
                onClick={handleEdit}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  'text-gray-600 dark:text-gray-400',
                  'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                  'hover:text-blue-600 dark:hover:text-blue-400'
                )}
                title={`Éditer la carte ${card.title}`}
                aria-label={`Éditer la carte ${card.title}`}
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={handleDelete}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  'text-gray-600 dark:text-gray-400',
                  'hover:bg-red-50 dark:hover:bg-red-900/20',
                  'hover:text-red-600 dark:hover:text-red-400'
                )}
                title={`Supprimer la carte ${card.title}`}
                aria-label={`Supprimer la carte ${card.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {card.description}
        </p>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Phone size={14} className="text-gray-400" />
            <span className="truncate">{card.phone}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Mail size={14} className="text-gray-400" />
            <span className="truncate">{card.email}</span>
          </div>
          
          {card.web && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Globe size={14} className="text-gray-400" />
              <a 
                href={card.web} 
                target="_blank" 
                rel="noopener noreferrer"
                className="truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {card.web}
              </a>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin size={14} className="text-gray-400" />
            <span className="truncate">
              {card.address.street} {card.address.houseNumber}, {card.address.city}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-300">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {likesCount} {likesCount === 1 ? 'like' : 'likes'}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Building size={12} />
            <span>#{card.bizNumber}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-dark-300',
        'hover:shadow-lg dark:hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700',
        'transition-all duration-300 overflow-hidden',
        viewMode === 'list' ? 'flex flex-row' : 'flex flex-col',
        className
      )}
      data-testid="card"
    >
      {cardContent}
    </motion.div>
  );
}
