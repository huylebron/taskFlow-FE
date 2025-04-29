import { defaultDropAnimation } from '@dnd-kit/core';

export const dropAnimation = {
  ...defaultDropAnimation,
  duration: 300,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  keyframes: ({ transform }) => [
    { transform: transform.initial, opacity: 0.9 },
    { transform: transform.final + ' scale(1.015)', opacity: 1, offset: 0.4 },
    { transform: transform.final + ' scale(0.98)', opacity: 1, offset: 0.7 },
    { transform: transform.final, opacity: 1 }
  ]
};

export const dragOverlay = {
  transform: 'scale(1.05)',
  cursor: 'grabbing',
  zIndex: 1000,
  backgroundColor: 'white',
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 20px, rgba(0, 0, 0, 0.1) 0px 3px 6px',
  transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
  animation: 'dragAnimation 0.45s cubic-bezier(0.2, 0, 0, 1) infinite alternate',
  '@keyframes dragAnimation': {
    '0%': {
      transform: 'scale(1.05) rotate(-0.5deg)',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 20px, rgba(0, 0, 0, 0.1) 0px 3px 6px'
    },
    '100%': {
      transform: 'scale(1.05) rotate(0.5deg)',
      boxShadow: 'rgba(0, 0, 0, 0.15) 0px 12px 24px, rgba(0, 0, 0, 0.1) 0px 4px 8px'
    }
  }
};

export const draggableItemModifier = {
  transform: 'scale(1.02)',
  backgroundColor: 'white',
  cursor: 'grabbing',
  opacity: 0.9,
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 20px, rgba(0, 0, 0, 0.1) 0px 3px 6px',
  transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
  '&:active': {
    cursor: 'grabbing',
    transform: 'scale(1.02)',
    opacity: 0.9,
    transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)'
  }
};

export const dropAnimation_onDragOver = {
  transform: 'scale(1.02)',
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 20px, rgba(0, 0, 0, 0.1) 0px 3px 6px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  transition: 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)'
}; 