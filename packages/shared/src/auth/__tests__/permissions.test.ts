/**
 * Tests unitarios para la matriz de permisos y funciones relacionadas
 */

import { 
  getPermissionsForUserType, 
  hasPermissions, 
  getAppAccess, 
  hasAppAccess,
  getAllPermissions,
  validatePermissions
} from '../permissions';
import { UserType } from '../../types/user';

describe('Permissions System', () => {
  describe('getPermissionsForUserType', () => {
    it('should return correct permissions for patient', () => {
      const permissions = getPermissionsForUserType('patient');
      expect(permissions).toContain('patient:read');
      expect(permissions).toContain('appointments:read');
      expect(permissions).not.toContain('admin:*');
    });

    it('should return correct permissions for doctor', () => {
      const permissions = getPermissionsForUserType('doctor');
      expect(permissions).toContain('doctor:read');
      expect(permissions).toContain('patients:read');
      expect(permissions).toContain('appointments:write');
      expect(permissions).not.toContain('admin:*');
    });

    it('should return correct permissions for company', () => {
      const permissions = getPermissionsForUserType('company');
      expect(permissions).toContain('company:read');
      expect(permissions).toContain('doctors:read');
      expect(permissions).not.toContain('admin:*');
    });

    it('should return wildcard permission for admin', () => {
      const permissions = getPermissionsForUserType('admin');
      expect(permissions).toContain('admin:*');
    });
  });

  describe('hasPermissions', () => {
    it('should allow wildcard permissions', () => {
      const userPermissions = ['admin:*'];
      expect(hasPermissions(userPermissions, ['patient:read'])).toBe(true);
      expect(hasPermissions(userPermissions, ['doctor:write', 'company:read'])).toBe(true);
    });

    it('should check specific permissions correctly', () => {
      const userPermissions = ['patient:read', 'appointments:write'];
      expect(hasPermissions(userPermissions, ['patient:read'])).toBe(true);
      expect(hasPermissions(userPermissions, ['appointments:write'])).toBe(true);
      expect(hasPermissions(userPermissions, ['doctor:read'])).toBe(false);
    });

    it('should require all permissions to be present', () => {
      const userPermissions = ['patient:read', 'appointments:write'];
      expect(hasPermissions(userPermissions, ['patient:read', 'appointments:write'])).toBe(true);
      expect(hasPermissions(userPermissions, ['patient:read', 'doctor:read'])).toBe(false);
    });
  });

  describe('getAppAccess', () => {
    it('should return correct app access for each user type', () => {
      expect(getAppAccess('patient')).toContain('patients');
      expect(getAppAccess('patient')).toContain('web-app');
      
      expect(getAppAccess('doctor')).toContain('doctors');
      expect(getAppAccess('doctor')).toContain('admin');
      
      expect(getAppAccess('company')).toContain('companies');
      expect(getAppAccess('company')).toContain('admin');
      
      expect(getAppAccess('admin')).toContain('admin:*');
    });
  });

  describe('hasAppAccess', () => {
    it('should allow wildcard app access', () => {
      const userAppAccess = ['admin:*'];
      expect(hasAppAccess(userAppAccess, 'patients')).toBe(true);
      expect(hasAppAccess(userAppAccess, 'doctors')).toBe(true);
    });

    it('should check specific app access', () => {
      const userAppAccess = ['patients', 'web-app'];
      expect(hasAppAccess(userAppAccess, 'patients')).toBe(true);
      expect(hasAppAccess(userAppAccess, 'web-app')).toBe(true);
      expect(hasAppAccess(userAppAccess, 'doctors')).toBe(false);
    });
  });

  describe('getAllPermissions', () => {
    it('should return all unique permissions excluding wildcard', () => {
      const allPermissions = getAllPermissions();
      expect(allPermissions).toContain('patient:read');
      expect(allPermissions).toContain('doctor:read');
      expect(allPermissions).toContain('company:read');
      expect(allPermissions).not.toContain('admin:*');
    });

    it('should contain only unique permissions', () => {
      const allPermissions = getAllPermissions();
      const uniquePermissions = new Set(allPermissions);
      expect(allPermissions.length).toBe(uniquePermissions.size);
    });
  });

  describe('validatePermissions', () => {
    it('should validate wildcard permissions', () => {
      expect(validatePermissions(['admin:*'])).toBe(true);
    });

    it('should validate existing permissions', () => {
      expect(validatePermissions(['patient:read', 'doctor:write'])).toBe(true);
    });

    it('should invalidate non-existing permissions', () => {
      expect(validatePermissions(['invalid:permission'])).toBe(false);
    });

    it('should handle empty permissions array', () => {
      expect(validatePermissions([])).toBe(true);
    });
  });
});
