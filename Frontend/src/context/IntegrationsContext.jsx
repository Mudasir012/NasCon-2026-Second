import React, { createContext } from 'react';

export const IntegrationsContext = createContext(null);

export function IntegrationsProvider({ children }) {
  return <IntegrationsContext.Provider value={{}}>{children}</IntegrationsContext.Provider>;
}
