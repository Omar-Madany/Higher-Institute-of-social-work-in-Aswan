import { auth } from "./firebase";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || err).toLowerCase();
  const code = String(err.code || "").toLowerCase();
  return msg.includes("quota") || msg.includes("resource-exhausted") || code.includes("resource-exhausted") || msg.includes("exceeded");
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  if (isQuotaError(error)) {
    console.warn("Firestore Quota Exceeded (graceful offline fallback triggered):", error instanceof Error ? error.message : String(error));
    try {
      sessionStorage.setItem("aswan_inst_firestore_quota_exceeded", "true");
    } catch (e) {}
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  // Logged to console successfully for diagnostics; we do not throw here
  // to avoid crashing React components or throwing uncaught exceptions in async listeners.
}

