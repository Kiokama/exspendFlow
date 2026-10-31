import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

let dbInstance: ReturnType<typeof getFirestore> | null = null;

export function getFirebaseFirestore() {
  if (dbInstance) return dbInstance;
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyDs14sgwxt4Eqa4yLb4rEquVj0yH_Uu-o8",
      authDomain: "gifted-catcher-dt8c4.firebaseapp.com",
      projectId: "gifted-catcher-dt8c4",
      storageBucket: "gifted-catcher-dt8c4.firebasestorage.app",
      messagingSenderId: "21277948734",
      appId: "1:21277948734:web:a58da7cf6dc62b56358a6f",
      firestoreDatabaseId: "ai-studio-expenseflow-a4360b2f-ba37-47ba-96e8-075968c814f0"
    };
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    dbInstance = firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    console.log("🔥 Cloud Firestore connected! Database ID:", firebaseConfig.firestoreDatabaseId || "default");
  } catch (err) {
    console.error("Failed to initialize Firebase Firestore:", err);
  }
  return dbInstance;
}

export async function syncCollection<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
): Promise<T[]> {
  const db = getFirebaseFirestore();
  if (!db) return initialData;

  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      if (initialData.length > 0) {
        console.log(`Seeding Firestore collection "${collectionName}" with ${initialData.length} items...`);
        for (const item of initialData) {
          await setDoc(doc(db, collectionName, item.id), item);
        }
      }
      return initialData;
    } else {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as T);
      });
      console.log(`Loaded ${items.length} records from Firestore collection "${collectionName}"`);
      return items;
    }
  } catch (err) {
    console.error(`Error loading collection "${collectionName}" from Firestore:`, err);
    return initialData;
  }
}

export async function clearAllCollections() {
  const db = getFirebaseFirestore();
  if (!db) return;
  const collections = [
    "users",
    "spaces",
    "expenses",
    "settlements",
    "budgets",
    "auditLogs",
    "recurringExpenses",
    "savingsGoals",
    "favoriteTemplates",
    "wallets",
    "bills"
  ];
  for (const colName of collections) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, colName, docSnap.id));
      }
      console.log(`🧹 Cleared Firestore collection "${colName}"`);
    } catch (err) {
      console.error(`Error clearing collection "${colName}":`, err);
    }
  }
}

export async function saveDocument<T extends { id: string }>(collectionName: string, item: T) {
  const db = getFirebaseFirestore();
  if (!db) return;
  try {
    await setDoc(doc(db, collectionName, item.id), item);
  } catch (err) {
    console.error(`Error saving document ${item.id} to ${collectionName}:`, err);
  }
}

export async function deleteDocument(collectionName: string, id: string) {
  const db = getFirebaseFirestore();
  if (!db) return;
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (err) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, err);
  }
}
