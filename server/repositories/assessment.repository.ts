import { storage } from '../storage';

export class AssessmentRepository {
  async getAssessmentById(id: number, createdBy?: string): Promise<any> {
    return storage.getAssessmentById(id, createdBy);
  }

  async createAssessment(data: any): Promise<any> {
    return storage.createAssessment(data);
  }

  async updateAssessment(id: number, data: any): Promise<any> {
    return storage.updateAssessment(id, data);
  }

  async deleteAssessment(id: number): Promise<any> {
    return storage.deleteAssessment(id);
  }

  async getAssessments(filter?: any): Promise<any[]> {
    return storage.getAssessments(filter);
  }
}