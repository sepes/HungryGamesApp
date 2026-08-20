import React from 'react';
import { splitEventText } from '../utils/eventText';

interface EventTextProps {
  text: string;
}

/**
 * Renders one event line, highlighting the tribute names the engine marked.
 * Every part is a React text child, so names are escaped by React rather than
 * being interpolated into an HTML string.
 */
const EventText: React.FC<EventTextProps> = ({ text }) => (
  <>
    {splitEventText(text).map((part, index) =>
      part.isName ? (
        <span key={index} className="player-highlight">{part.text}</span>
      ) : (
        <React.Fragment key={index}>{part.text}</React.Fragment>
      )
    )}
  </>
);

export default EventText;
