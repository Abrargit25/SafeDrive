import { getDatabase } from './connection';
import type { AiFeedbackRow } from './types';

export async function createAiFeedback(sessionId: number, feedback: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO ai_feedback (session_id, feedback, created_at)
     VALUES (?, ?, datetime('now'))`,
    sessionId,
    feedback,
  );
  return result.lastInsertRowId;
}

export async function upsertAiFeedback(sessionId: number, feedback: string): Promise<void> {
  const existing = await getAiFeedbackBySessionId(sessionId);
  if (existing) {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE ai_feedback SET feedback = ?, created_at = datetime('now') WHERE session_id = ?`,
      feedback,
      sessionId,
    );
    return;
  }
  await createAiFeedback(sessionId, feedback);
}

export async function getAiFeedbackBySessionId(sessionId: number): Promise<AiFeedbackRow | null> {
  const db = await getDatabase();
  return db.getFirstAsync<AiFeedbackRow>(
    'SELECT * FROM ai_feedback WHERE session_id = ?',
    sessionId,
  );
}

export async function getAiFeedbackMap(): Promise<Record<number, string>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Pick<AiFeedbackRow, 'session_id' | 'feedback'>>(
    'SELECT session_id, feedback FROM ai_feedback',
  );
  return Object.fromEntries(rows.map((row) => [row.session_id, row.feedback]));
}

export async function deleteAiFeedbackBySessionId(sessionId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM ai_feedback WHERE session_id = ?', sessionId);
}
