import { useEffect } from 'react';

interface UseKeyboardProps {
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
}

export const useKeyboard = ({ onDelete, onCopy, onPaste }: UseKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the target is an input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        onDelete();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        onCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        onPaste();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDelete, onCopy, onPaste]);
};