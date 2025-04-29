import { Card as MuiCard } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import GroupIcon from '@mui/icons-material/Group';
import CommentIcon from '@mui/icons-material/Comment';
import AttachmentIcon from '@mui/icons-material/Attachment';
import LabelIcon from '@mui/icons-material/Label';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDispatch } from 'react-redux';
import { updateCurrentActiveCard, showModalActiveCard } from '~/redux/activeCard/activeCardSlice';
import { format } from 'date-fns';

const LABEL_COLORS = {
  bug: '#e11d48',
  feature: '#8b5cf6',
  enhancement: '#06b6d4',
  documentation: '#f59e0b',
  design: '#ec4899',
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981'
};

function Card({ card }) {
  const dispatch = useDispatch();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
    data: { ...card }
  });
  
  const dndKitCardStyles = {
    touchAction: 'none',
    transition: isDragging 
      ? 'all 0.15s cubic-bezier(0.2, 0, 0, 1)'
      : 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
    transform: isDragging 
      ? `${CSS.Translate.toString(transform)} scale(1.02)`
      : CSS.Translate.toString(transform),
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? 'grabbing' : 'pointer',
    position: isDragging ? 'relative' : 'static',
    zIndex: isDragging ? 9999 : 1,
    backgroundColor: isDragging ? 'white' : 'white',
    borderRadius: '8px',
    border: isDragging 
      ? '1px solid rgba(0, 121, 191, 0.2)'
      : '1px solid transparent',
    boxShadow: isDragging 
      ? 'rgba(0, 0, 0, 0.1) 0px 10px 20px, rgba(0, 0, 0, 0.1) 0px 3px 6px' 
      : 'rgba(0, 0, 0, 0.05) 0px 1px 3px',
    '&:hover': !isDragging && {
      backgroundColor: '#f8f9fa',
      borderColor: 'rgba(0, 121, 191, 0.2)',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 3px 8px',
      transform: `${CSS.Translate.toString(transform)} translateY(-2px)`,
      '& .card-actions': {
        opacity: 1,
        visibility: 'visible'
      }
    },
    '& .card-actions': {
      opacity: 0,
      visibility: 'hidden',
      transition: 'all 0.2s ease'
    }
  };

  const shouldShowCardActions = () => {
    return !!card?.memberIds?.length || !!card?.comments?.length || !!card?.attachments?.length;
  };

  const setActiveCard = () => {
    // Update the activeCard data in Redux
    dispatch(updateCurrentActiveCard(card));
    // Show the ActiveCard modal
    dispatch(showModalActiveCard());
  };

  // Helper to render card labels
  const renderLabels = () => {
    if (!card?.labels || card.labels.length === 0) return null;
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {card.labels.slice(0, 3).map((label, index) => (
          <Chip
            key={index}
            label={label}
            size="small"
            sx={{ 
              height: '20px',
              fontSize: '0.7rem',
              bgcolor: LABEL_COLORS[label.toLowerCase()] || '#9ca3af',
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-label': { px: 1 }
            }}
          />
        ))}
        {card.labels.length > 3 && (
          <Tooltip title={card.labels.slice(3).join(', ')}>
            <Chip
              label={`+${card.labels.length - 3}`}
              size="small"
              sx={{ 
                height: '20px',
                fontSize: '0.7rem',
                bgcolor: '#9ca3af',
                color: 'white'
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  // Helper to render due date if available
  const renderDueDate = () => {
    if (!card?.dueDate) return null;
    
    const dueDate = new Date(card.dueDate);
    const isOverdue = dueDate < new Date() && !card.completed;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <ScheduleIcon 
          fontSize="small" 
          sx={{ 
            color: isOverdue ? 'error.main' : card.completed ? 'success.main' : 'text.secondary',
            fontSize: '0.9rem'
          }} 
        />
        <Typography variant="caption" color={isOverdue ? 'error' : card.completed ? 'success.main' : 'text.secondary'}>
          {format(dueDate, 'MMM d')}
        </Typography>
      </Box>
    );
  };

  // Don't render placeholder cards
  if (card?.FE_PlaceholderCard) return null;

  return (
    <MuiCard
      ref={setNodeRef}
      style={dndKitCardStyles}
      {...attributes}
      {...listeners}
      onClick={setActiveCard}
      sx={{
        mb: 1.5,
        cursor: 'pointer',
        outline: 'none',
        overflow: card?.cover ? 'hidden' : 'visible',
        display: card?.FE_PlaceholderCard ? 'none' : 'block'
      }}
    >
      {card?.cover && (
        <CardMedia 
          sx={{ 
            height: 140,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }} 
          image={card?.cover}
          alt={card?.title}
        />
      )}
      
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        {renderLabels()}
        
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 500,
            fontSize: '0.9rem', 
            lineHeight: 1.3,
            mb: card?.description ? 1 : 0
          }}
        >
          {card?.title}
        </Typography>
        
        {card?.description && (
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3,
              fontSize: '0.75rem'
            }}
          >
            {card.description}
          </Typography>
        )}
        
        {renderDueDate()}
      </CardContent>
      
      {shouldShowCardActions() && (
        <CardActions sx={{ p: '0 8px 8px 8px', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!!card?.memberIds?.length && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AvatarGroup 
                  max={3}
                  sx={{ 
                    '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.75rem' }
                  }}
                >
                  {card.memberIds.map((member, index) => (
                    <Tooltip key={index} title={member}>
                      <Avatar 
                        alt={member}
                        src={`https://i.pravatar.cc/150?u=${member}`} 
                        sx={{ width: 24, height: 24 }} 
                      />
                    </Tooltip>
                  ))}
                </AvatarGroup>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {!!card?.comments?.length && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CommentIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {card?.comments?.length}
                </Typography>
              </Box>
            )}
            
            {!!card?.attachments?.length && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachmentIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {card?.attachments?.length}
                </Typography>
              </Box>
            )}
          </Box>
        </CardActions>
      )}
    </MuiCard>
  );
}

export default Card;
