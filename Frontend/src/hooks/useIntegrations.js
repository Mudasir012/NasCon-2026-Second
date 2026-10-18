import { useContext } from 'react';
import { IntegrationsContext } from '../context/IntegrationsContext';

export function useIntegrations() {
  return useContext(IntegrationsContext);
}
