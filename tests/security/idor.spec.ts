import { canAccessPatientRecord } from '../server/services/authz/patient-access';
import { logAccessAttempt } from '../server/security/access-audit';

enum UserRole {
  ADMIN = 'admin',
  PROVIDER = 'provider',
  PATIENT = 'patient',
}

describe('Patient Access Authorization Tests', () => {
  describe('canAccessPatientRecord', () => {
    const adminUser = { id: 1, role: UserRole.ADMIN, email: 'admin@test.com' };
    const providerUser = { id: 2, role: UserRole.PROVIDER, email: 'provider@test.com' };
    const patientUser = { id: 3, role: UserRole.PATIENT, email: 'patient@test.com' };

    const adminRecord = { id: 1, createdBy: 'admin@test.com', doctorId: 1, patientId: 1 };
    const providerRecord = { id: 2, createdBy: 'provider@test.com', doctorId: 2, patientId: 3 };
    const patientRecord = { id: 3, createdBy: 'other@test.com', doctorId: 3, patientId: 3 };

    test('admin can access any record', () => {
      expect(canAccessPatientRecord(adminUser, adminRecord)).toBe(true);
      expect(canAccessPatientRecord(adminUser, providerRecord)).toBe(true);
      expect(canAccessPatientRecord(adminUser, patientRecord)).toBe(true);
    });

    test('provider can access records they created or they doctor', () => {
      expect(canAccessPatientRecord(providerUser, adminRecord)).toBe(false);
      expect(canAccessPatientRecord(providerUser, providerRecord)).toBe(true);
      expect(canAccessPatientRecord(providerUser, patientRecord)).toBe(false);
    });

    test('patient can only access their own record', () => {
      expect(canAccessPatientRecord(patientUser, adminRecord)).toBe(false);
      expect(canAccessPatientRecord(patientUser, providerRecord)).toBe(false);
      expect(canAccessPatientRecord(patientUser, patientRecord)).toBe(true);
    });
  });

  describe('logAccessAttempt', () => {
    test('logs access attempt successfully', async () => {
      const mockLog = jest.spyOn(require('../server/storage').storage, 'logAccessAttempt');
      await logAccessAttempt(1, 'Assessment', 1, true, 'Authorized access');
      expect(mockLog).toHaveBeenCalledWith(1, 'Assessment', 1, true, 'Authorized access');
    });

    test('handles logging errors gracefully', async () => {
      const mockLog = jest.spyOn(require('../server/storage').storage, 'logAccessAttempt');
      mockLog.mockRejectedValue(new Error('Database error'));
      await expect(logAccessAttempt(1, 'Assessment', 1, false, 'Unauthorized')).resolves.not.toThrow();
    });
  });
});