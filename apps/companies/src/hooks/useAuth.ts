// For now, create a minimal mock useAuth hook until the shared package is properly configured
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'company' | 'admin';
  first_name: string;
  last_name: string;
  token?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Mock authentication check
    const token = localStorage.getItem('authToken');
    if (token) {
      // Mock user data
      setUser({
        id: 'company-123',
        email: 'admin@hospital.com',
        role: 'company',
        first_name: 'Admin',
        last_name: 'Hospital',
        token
      });
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login: async () => { /* mock */ },
    logout: () => {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };
}