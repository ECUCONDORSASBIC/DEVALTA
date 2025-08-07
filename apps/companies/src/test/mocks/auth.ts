import React from 'react';

export const mockAuth = {
  user: {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  },
  isAuthenticated: true,
  isAuthenticating: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
};

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This component will be used to wrap our test components
  // It will provide a mock auth context
  return <>{children}</>;
};
