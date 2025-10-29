import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { apiService } from '../lib/api';
import { Card as CardType } from '../types';
import { 
  ArrowLeft, 
  Heart, 
 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Edit, 
  Trash2,
  Share,
  User,
  Calendar,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [card, setCard] = useState<CardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCard = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getCard(id);
      setCard(response);
      setLikesCount(response.likes?.length || 0);
      setIsLiked(user ? response.likes?.some((like: any) => 
        typeof like === 'string' ? like === user._id : like._id === user._id
      ) || false : false);
    } catch {
      toast.error(t('cardDetail.loadError'));
      navigate('/cards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!card || !user) {
      toast.error(t('cardDetail.loginToLike'));
      return;
    }

    try {
      await apiService.likeCard(card._id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      toast.success(isLiked ? t('cardDetail.likeRemoved') : t('cardDetail.cardLiked'));
    } catch {
      toast.error(t('cardDetail.likeError'));
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    
    if (window.confirm(t('cardDetail.deleteConfirm'))) {
      try {
        await apiService.deleteCard(card._id);
        toast.success(t('cardDetail.deleteSuccess'));
        navigate('/cards');
      } catch {
        toast.error(t('cardDetail.deleteError'));
      }
    }
  };

  const handleShare = async () => {
    if (!card) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: card.title,
          text: card.description,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t('cardDetail.linkCopied'));
      }
    } catch {
      toast.error(t('cardDetail.shareError'));
    }
  };

  const isOwner = () => {
    return user && card && (
      typeof card.user_id === 'string' 
        ? card.user_id === user._id 
        : card.user_id._id === user._id
    );
  };

  const getOwnerInfo = () => {
    if (!card) return null;
    
    if (typeof card.user_id === 'string') {
      return { name: t('cardDetail.user'), isBusiness: false };
    }
    
    const owner = card.user_id;
    return {
      name: `${owner.name.first} ${owner.name.last}`,
      isBusiness: owner.isBusiness
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">{t('cardDetail.loading')}</span>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('cardDetail.notFound')}</h2>
          <p className="text-gray-600 mb-6">{t('cardDetail.notFoundMessage')}</p>
          <Button onClick={() => navigate('/cards')}>
            {t('cardDetail.backToCards')}
          </Button>
        </div>
      </div>
    );
  }

  const ownerInfo = getOwnerInfo();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/cards')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('cardDetail.backToCards')}
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share className="w-4 h-4" />
            </Button>
            
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                <span>{likesCount}</span>
              </Button>
            )}
            
            {isOwner() && (
              <>
                <Link to={`/cards/${card._id}/edit`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Card Content */}
        <div className="lg:col-span-2">
          <Card className="p-8">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {card.title}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {card.subtitle}
                </p>
                
                {/* Business Number */}
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  #{card.bizNumber}
                </div>
              </div>
              
              {card.image?.url && (
                <div className="ml-6">
                  <img
                    src={card.image.url}
                    alt={card.image.alt || card.title}
                    className="w-24 h-24 rounded-xl object-cover shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('cardDetail.description')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('cardDetail.contact')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">{t('cardDetail.phone')}</p>
                    <a 
                      href={`tel:${card.phone.replace(/[-\s]/g, '')}`}
                      className="text-gray-900 hover:text-primary-600 transition-colors cursor-pointer"
                      onClick={(e) => {
                        // Fallback pour les navigateurs desktop
                        if (!navigator.userAgent.match(/Mobile|Android|iPhone|iPad/)) {
                          e.preventDefault();
                          navigator.clipboard.writeText(card.phone);
                          toast.success(t('cardDetail.phoneCopied') || 'Numéro copié!');
                        }
                      }}
                    >
                      {card.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">{t('cardDetail.email')}</p>
                    <a 
                      href={`mailto:${card.email}`}
                      className="text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {card.email}
                    </a>
                  </div>
                </div>

                {card.web && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">{t('cardDetail.website')}</p>
                      <a 
                        href={card.web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {card.web}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">{t('cardDetail.address')}</p>
                    <p className="text-gray-900">
                      {card.address.houseNumber} {card.address.street}
                      <br />
                      {card.address.zip ? `${card.address.zip} ` : ''}{card.address.city}
                      {card.address.state && `, ${card.address.state}`}
                      <br />
                      {card.address.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Info */}
          {ownerInfo && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                {t('cardDetail.owner')}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{ownerInfo.name}</p>
                  <div className="flex items-center mt-1">
                    {ownerInfo.isBusiness ? (
                      <Building className="w-4 h-4 text-blue-500 mr-1" />
                    ) : (
                      <User className="w-4 h-4 text-gray-400 mr-1" />
                    )}
                    <span className="text-sm text-gray-600">
                      {ownerInfo.isBusiness ? t('cardDetail.businessAccount') : t('cardDetail.personalAccount')}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Card Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('cardDetail.statistics')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Heart className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{t('cardDetail.likes')}</span>
                </div>
                <span className="font-medium text-gray-900">{likesCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{t('cardDetail.createdOn')}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(card.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('cardDetail.actions')}</h3>
            <div className="space-y-3">
              <Button
                onClick={handleShare}
                variant="ghost"
                className="w-full justify-start"
              >
                <Share className="w-4 h-4 mr-2" />
{t('cardDetail.shareCard')}
              </Button>
              
              {user && !isOwner() && (
                <Button
                  onClick={handleLike}
                  variant="ghost"
                  className={`w-full justify-start ${isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? t('cardDetail.unlikeCard') : t('cardDetail.likeCard')}
                </Button>
              )}
              
              {isOwner() && (
                <>
                  <Link to={`/cards/${card._id}/edit`} className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      <Edit className="w-4 h-4 mr-2" />
                      {t('cardDetail.editCard')}
                    </Button>
                  </Link>
                  
                  <Button
                    onClick={handleDelete}
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('cardDetail.deleteCard')}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
