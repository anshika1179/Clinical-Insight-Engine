import express from 'express';
import { requireAuth, requireVerified } from '../auth';
import { api } from '@shared/routes';
import { storage } from '../storage';
import { AssessmentRepository } from '../repositories/assessment.repository';
import { generateRecommendations } from '../services/recommendation-engine';
import { requireAssessmentAccess } from '../middleware/requireAssessmentAccess';
import { canAccessPatientRecord } from '../services/authz/patient-access';
import { logAccessAttempt } from '../security/access-audit';

const assessmentsRouter = express.Router();
const assessmentRepository = new AssessmentRepository();

assessmentsRouter.get(
  '/',
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const createdBy = user.email;
      const assessments = await assessmentRepository.getAssessments({ createdBy });
      const mapped = assessments.map((a: any) => ({
        id: a.id,
        patientId: a.patientId,
        doctorId: a.doctorId,
        riskCategory: a.riskCategory,
        createdAt: a.createdAt,
        patientName: a.patientName,
        doctorName: a.doctorName,
        completedAt: a.completedAt,
        format: a.format,
        riskScore: a.riskScore,
        biomarkers: a.biomarkers,
        predictions: a.predictions,
        notes: a.notes,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        status: a.status,
        type: a.type,
        timezone: a.timezone,
        createdBy: a.createdBy,
      }));

      res.json(mapped);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch assessments' });
    }
  }
);

assessmentsRouter.get(
  '/:id',
  requireAuth,
  requireVerified,
  requireAssessmentAccess,
  async (req, res) => {
    try {
      const assessment = req.assessment;
      const recommendations = generateRecommendations({ ...assessment, riskCategory: assessment.riskCategory });
      return res.json({ ...assessment, recommendations });
    } catch (err) {
      console.error(err);
      const { statusCode, message } = sanitizeDatabaseError(err as Error);
      return res.status(statusCode || 500).json({ message });
    }
  }
);

assessmentsRouter.delete(
  '/:id',
  requireAuth,
  requireVerified,
  requireAssessmentAccess,
  async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id as string, 10);
      await storage.deleteAssessment(assessmentId);
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to delete assessment' });
    }
  }
);

assessmentsRouter.post(
  '/',
  requireAuth,
  requireVerified,
  async (req, res) => {
    try {
      const data = req.body;
      const createdBy = req.session.user?.email;
      const assessment = await assessmentRepository.createAssessment({ ...data, createdBy });
      return res.status(201).json(assessment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to create assessment' });
    }
  }
);

function sanitizeDatabaseError(err: Error) {
  return { statusCode: 500, message: 'Database error' };
}

export { assessmentsRouter };