import React, { createContext } from 'react';

export const CRMContext = createContext(null);

export function CRMProvider({ children }) {
  return <CRMContext.Provider value={{}}>{children}</CRMContext.Provider>;
}
