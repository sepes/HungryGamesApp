import React from 'react';
import styles from './VolunteerScreen/VolunteerScreen.module.scss';

export default function VolunteerScreen({ 
  volunteers, 
  maxSlots, 
  onStartGame, 
  onCancel,
  channelName 
}) {
  const slotsFilled = volunteers.length;
  const canStart = slotsFilled >= 2;

  return (
    <div className={styles.volunteerScreen}>
      <header className="game-header">
        <h1>Accepting Volunteers</h1>
        <p className={styles.channelInfo}>Connected to: {channelName}</p>
      </header>

      <div className="center-panel">
        <section className={styles.volunteerInfo}>
          <h2>How to Join</h2>
          <p>
            Viewers can type <strong>&quot;I volunteer&quot;</strong> in chat to enter the Hunger Games!
          </p>
        </section>

        <section className={styles.slotStatus} aria-live="polite">
          <h2>Volunteer Status</h2>
          <div className={styles.statusBar}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progress} 
                style={{ width: `${(slotsFilled / maxSlots) * 100}%` }}
                role="progressbar"
                aria-valuenow={slotsFilled}
                aria-valuemin="0"
                aria-valuemax={maxSlots}
                aria-label={`${slotsFilled} out of ${maxSlots} volunteer slots filled`}
              />
            </div>
            <span className={styles.statusText}>
              {slotsFilled} / {maxSlots} Tributes
            </span>
          </div>
        </section>

        <section className={styles.volunteerList}>
          <h2 id="volunteer-list-heading">Current Volunteers</h2>
          {volunteers.length === 0 ? (
            <p className={styles.emptyMessage}>Waiting for volunteers...</p>
          ) : (
            <ul aria-labelledby="volunteer-list-heading">
              {volunteers.map((name, idx) => (
                <li key={idx} className={styles.volunteerItem}>
                  <span className={styles.volunteerNumber}>{idx + 1}</span>
                  <span className={styles.volunteerName}>{name}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="right-panel">
        <div className={styles.actionControls}>
          <button 
            onClick={onStartGame}
            className="transition-button large"
            disabled={!canStart}
            aria-label={canStart ? 'Start the game now' : `Need at least 2 volunteers to start (currently ${slotsFilled})`}
          >
            {canStart ? `Start Game (${slotsFilled} Tributes)` : 'Waiting for Volunteers'}
          </button>
          
          <button 
            onClick={onCancel}
            className="transition-button small orange"
            aria-label="Cancel volunteer collection"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


