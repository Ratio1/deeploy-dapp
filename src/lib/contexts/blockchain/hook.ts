import { useContext } from 'react';
import { BlockchainContext } from './context';

export const useBlockchainContext = () => useContext(BlockchainContext);
