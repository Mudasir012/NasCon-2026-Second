import React, { createContext } from 'react';

export const EscalationContext = createContext(null);

export function EscalationProvider({ children }) {
  return <EscalationContext.Provider value={{}}>{children}</EscalationContext.Provider>;
}
