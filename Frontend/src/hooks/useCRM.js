import { useContext } from 'react';
import { CRMContext } from '../context/CRMContext';

export function useCRM() {
  return useContext(CRMContext);
}
