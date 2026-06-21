export function canAccessPatientRecord(user: any, record: any): boolean {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'provider') {
    return user.email === record.createdBy || user.id === record.doctorId;
  }

  if (user.role === 'patient') {
    return user.id === record.patientId;
  }

  return false;
}

export function canAccessRecordById(user: any, recordId: number, records: any[]): boolean {
  const record = records.find((r) => r.id === recordId);
  if (!record) {
    return false;
  }
  return canAccessPatientRecord(user, record);
}