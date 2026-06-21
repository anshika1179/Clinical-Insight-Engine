import { storage } from '../storage';

export async function logAccessAttempt(
  userId: number,
  resourceType: string,
  resourceId: number,
  granted: boolean,
  reason: string
): Promise<void> {
  try {
    await storage.logAccessAttempt(userId, resourceType, resourceId, granted, reason);
  } catch (err) {
    console.error('Failed to log access attempt:', err);
  }
}