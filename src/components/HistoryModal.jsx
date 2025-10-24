import React, { useEffect } from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';

const HistoryModal = ({ isOpen, onClose, eventHistory }) => {
  const containerRef = useFocusTrap(isOpen);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="history-modal-backdrop" onClick={onClose}>
      <div 
        className="history-modal"
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="history-modal-content">
          <div className="history-modal-header">
            <h2 id="history-modal-title">Full Game History</h2>
            <button 
              onClick={onClose} 
              className="danger-button close"
              aria-label="Close history modal"
            >
              ×
            </button>
          </div>
          
          <div className="history-modal-body" aria-live="polite">
            <div className="history-log">
              {eventHistory.map((segment, idx) => (
                <div key={idx} className="history-segment">
                  {segment.map((event, i) => (
                    <div key={i} className="history-event" dangerouslySetInnerHTML={{ __html: event }} />
                  ))}
                  <hr className="segment-divider" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
