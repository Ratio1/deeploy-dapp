import { useContext } from 'react';
import { AuthenticationContext } from './context';

export const useAuthenticationContext = () => useContext(AuthenticationContext);
