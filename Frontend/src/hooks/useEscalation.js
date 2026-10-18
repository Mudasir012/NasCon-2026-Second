import { useContext } from 'react';
import { EscalationContext } from '../context/EscalationContext';

export function useEscalation() {
  return useContext(EscalationContext);
}
