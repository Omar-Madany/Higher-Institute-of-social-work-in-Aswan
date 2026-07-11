import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// Use the custom provisioned multi-tenant database ID unconditionally
const databaseId = firebaseConfig.firestoreDatabaseId;

// Standard, high-performance connection with persistent offline cache and long-polling configuration to bypass WebSocket constraints in the sandboxed preview
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true,
}, databaseId);

export const auth = getAuth(app);
