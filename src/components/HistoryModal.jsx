import React, { useEffect } from 'react';
import { useFocusTrap } from '../utils/useFocusTrap';
import styles from './HistoryModal/HistoryModal.module.scss';

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
    <div className={styles.historyModalBackdrop} onClick={onClose}>
      <div 
        className={styles.historyModal}
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.historyModalContent}>
          <div className={styles.historyModalHeader}>
            <h2 id="history-modal-title">Full Game History</h2>
            <button 
              onClick={onClose} 
              className="danger-button close"
              aria-label="Close history modal"
            >
              ×
            </button>
          </div>
          
          <div className={styles.historyModalBody} aria-live="polite">
            <div className={styles.historyLog}>
              {eventHistory.map((segment, idx) => (
                <div key={idx} className="history-segment">
                  {segment.map((event, i) => (
                    <div key={i} className={styles.historyEvent} dangerouslySetInnerHTML={{ __html: event }} />
                  ))}
                  <hr className={styles.segmentDivider} />
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
