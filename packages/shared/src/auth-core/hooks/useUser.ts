// useUser hook - Provides user information and actions
import { useAuth } from '../providers/AuthProvider';

export const useUser = () => {
  const authContext = useAuth();
  
  return {
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    login: authContext.login,
    register: authContext.register,
    logout: authContext.logout,
    updateProfile: authContext.updateProfile,
    refreshProfile: authContext.refreshProfile,
    getDashboardUrl: authContext.getDashboardUrl,
  };
};

export default useUser;
