export { getDatabase, withTransaction } from './connection';
export { CREATE_TABLES_SQL, DATABASE_NAME } from './schema';

export {
  createDriveSession,
  updateDriveSession,
  getDriveSessionById,
  getAllDriveSessions,
  deleteDriveSession,
} from './DriveSessionHelper';

export {
  createDriveEvent,
  createDriveEvents,
  getDriveEventsBySessionId,
  deleteDriveEventsBySessionId,
} from './DriveEventHelper';

export {
  createSensorSummary,
  getSensorSummaryBySessionId,
  updateSensorSummary,
  deleteSensorSummaryBySessionId,
} from './SensorSummaryHelper';

export {
  createAiFeedback,
  upsertAiFeedback,
  getAiFeedbackBySessionId,
  getAiFeedbackMap,
  deleteAiFeedbackBySessionId,
} from './AiFeedbackHelper';

export {
  startDriveSession,
  saveCompletedDrive,
  loadDriveSessions,
  getDriveSessionDetails,
  buildSensorStats,
} from './DriveDatabase';

export { migrateLegacySessionsIfNeeded } from './migration';

export type {
  DriveSessionRow,
  DriveEventRow,
  SensorSummaryRow,
  CreateDriveSessionInput,
  UpdateDriveSessionInput,
  CreateDriveEventInput,
  CreateSensorSummaryInput,
  SensorStats,
  SaveCompletedDriveInput,
} from './types';
