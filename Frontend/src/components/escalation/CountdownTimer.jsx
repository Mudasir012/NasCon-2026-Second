import React from 'react';

export default function CountdownTimer({ secondsRemaining }) {
  return <span className="countdown">{secondsRemaining}s</span>;
}
