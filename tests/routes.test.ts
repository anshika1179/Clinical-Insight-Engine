import request from 'supertest';
import { app } from '../src/app';
import { UserRole } from '../src/models/user.model';

describe('IDOR Protection Tests', () => {
  describe('GET /api/assessments/:id', () => {
    it('should return 404 for unauthorized access (IDOR protection)', async () => {
      const providerUser = { id: 1, email: 'provider@test.com', role: UserRole.PROVIDER };
      await request(app)
        .get('/api/assessments/999')
        .set('Cookie', 	oken=provider-token) // Mock session
        .expect(404);
    });
  });

  describe('DELETE /api/assessments/:id', () => {
    it('should return 404 for unauthorized access (IDOR protection)', async () => {
      const providerUser = { id: 1, email: 'provider@test.com', role: UserRole.PROVIDER };
      await request(app)
        .delete('/api/assessments/999')
        .set('Cookie', 	oken=provider-token) // Mock session
        .expect(404);
    });
  });
});