import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SimpleAuthSystem from './SimpleAuthSystem';

// Mock window.location.href
delete (window as any).location;
window.location = { href: '' } as Location;

describe('SimpleAuthSystem', () => {
  describe('getRedirectUrl', () => {
    it('should redirect to correct URLs based on user type', async () => {
      const { container } = render(<SimpleAuthSystem />);
      
      // Fill in login form with demo credentials
      const emailInput = screen.getByPlaceholderText('tu@email.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(emailInput, { target: { value: 'demo@altamedica.com' } });
      fireEvent.change(passwordInput, { target: { value: 'demo123' } });
      
      // Test patient redirect
      const userTypeSelect = container.querySelector('select');
      if (userTypeSelect) {
        fireEvent.change(userTypeSelect, { target: { value: 'patient' } });
      }
      
      const loginButton = screen.getByText('Iniciar Sesión');
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(window.location.href).toBe('http://localhost:3004');
      }, { timeout: 2000 });
      
      // Reset location
      window.location.href = '';
      
      // Test doctor redirect
      if (userTypeSelect) {
        fireEvent.change(userTypeSelect, { target: { value: 'doctor' } });
      }
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(window.location.href).toBe('http://localhost:3003');
      }, { timeout: 2000 });
      
      // Reset location
      window.location.href = '';
      
      // Test company redirect
      if (userTypeSelect) {
        fireEvent.change(userTypeSelect, { target: { value: 'company' } });
      }
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(window.location.href).toBe('http://localhost:3002');
      }, { timeout: 2000 });
      
      // Reset location
      window.location.href = '';
      
      // Test admin redirect
      if (userTypeSelect) {
        fireEvent.change(userTypeSelect, { target: { value: 'admin' } });
      }
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(window.location.href).toBe('http://localhost:3005');
      }, { timeout: 2000 });
    });
  });
  
  describe('Registration flow', () => {
    it('should redirect to correct dashboard after successful registration', async () => {
      const { container } = render(<SimpleAuthSystem />);
      
      // Switch to register mode
      const switchButton = screen.getByText('¿No tienes cuenta? Regístrate');
      fireEvent.click(switchButton);
      
      // Fill registration form
      const firstNameInput = screen.getByPlaceholderText('Juan');
      const lastNameInput = screen.getByPlaceholderText('Pérez');
      const emailInput = screen.getByPlaceholderText('tu@email.com');
      const passwordInput = screen.getAllByPlaceholderText('••••••••')[0];
      const confirmPasswordInput = screen.getAllByPlaceholderText('••••••••')[1];
      
      fireEvent.change(firstNameInput, { target: { value: 'Test' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(emailInput, { target: { value: 'test@altamedica.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      
      // Select user type as doctor
      const userTypeSelect = container.querySelector('select');
      if (userTypeSelect) {
        fireEvent.change(userTypeSelect, { target: { value: 'doctor' } });
      }
      
      // Submit registration
      const registerButton = screen.getByText('Crear Cuenta');
      fireEvent.click(registerButton);
      
      // Wait for registration to complete
      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido a ALTAMEDICA!')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Click dashboard button
      const dashboardButton = screen.getByText('Ir a mi Dashboard');
      fireEvent.click(dashboardButton);
      
      // Verify redirect to doctor dashboard
      expect(window.location.href).toBe('http://localhost:3003');
    });
  });
});
