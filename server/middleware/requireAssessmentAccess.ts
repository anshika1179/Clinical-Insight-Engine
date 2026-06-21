import { Request, Response, NextFunction } from 'express';
import { canAccessPatientRecord } from '../services/authz/patient-access';
import { logAccessAttempt } from '../security/access-audit';
import { storage } from '../storage';

export const requireAssessmentAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const assessmentId = parseInt(req.params.id as string, 10);
    if (isNaN(assessmentId) || assessmentId <= 0) {
      return res.status(400).json({ message: 'Invalid assessment ID.' });
    }

    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const assessment = await storage.getAssessmentById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    if (!canAccessPatientRecord(user as any, assessment)) {
      logAccessAttempt(
        (user as any).id,
        'Assessment',
        assessmentId,
        false,
        'IDOR attempt: User not authorized to access this patient record'
      );
      return res.status(404).json({ message: 'Assessment not found.' });
    }

    logAccessAttempt((user as any).id, 'Assessment', assessmentId, true, 'Authorized access');
    req.assessment = assessment;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};