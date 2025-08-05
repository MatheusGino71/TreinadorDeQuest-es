import { 
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Firestore service functions
export const firestoreService = {
  // Create a new document with auto-generated ID
  async createDocument(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  },

  // Create/Set a document with custom ID
  async setDocument(collectionName: string, docId: string, data: any) {
    try {
      await setDoc(doc(db, collectionName, docId), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error setting document:", error);
      throw error;
    }
  },

  // Get a single document
  async getDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  },

  // Update a document
  async updateDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(collectionName: string, docId: string) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  // Get all documents from a collection
  async getCollection(collectionName: string, ...constraints: QueryConstraint[]) {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting collection:", error);
      throw error;
    }
  },

  // Listen to real-time updates on a document
  onDocumentSnapshot(collectionName: string, docId: string, callback: (data: any) => void) {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  },

  // Listen to real-time updates on a collection
  onCollectionSnapshot(collectionName: string, callback: (data: any[]) => void, ...constraints: QueryConstraint[]) {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (querySnapshot) => {
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(docs);
    });
  },

  // Query helper functions
  createQuery: {
    where: (field: string, operator: any, value: any) => where(field, operator, value),
    orderBy: (field: string, direction: "asc" | "desc" = "asc") => orderBy(field, direction),
    limit: (limitCount: number) => limit(limitCount)
  }
};
