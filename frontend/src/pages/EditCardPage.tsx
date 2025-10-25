import { useParams, Navigate } from 'react-router-dom';
import CreateCardPage from './CreateCardPage';
import { PageProps } from '@/types';

/**
 * EditCardPage - Wrapper component for editing existing cards
 * This component reuses the CreateCardPage logic but ensures we have a cardId
 * and provides better semantic routing for /edit-card/:id routes
 */
export default function EditCardPage({ className }: PageProps = {}) {
  const { cardId } = useParams<{ cardId: string }>();

  // If no cardId is provided, redirect to create new card
  if (!cardId) {
    return <Navigate to="/create-card" replace />;
  }

  // Render the CreateCardPage which handles both create and edit modes
  return <CreateCardPage className={className} />;
}
