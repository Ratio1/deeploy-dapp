import { useContext } from 'react';
import { DeploymentContext } from './context';

export const useDeploymentContext = () => useContext(DeploymentContext);
