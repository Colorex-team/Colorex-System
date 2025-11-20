import { Timestamp } from 'firebase-admin/firestore';

export function firebaseNormalize(obj: any): any {
  if (!obj) return obj;

  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(firebaseNormalize);
  }

  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, firebaseNormalize(v)])
    );
  }

  return obj;
}
