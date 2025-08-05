import { useState, useEffect } from 'react';
import { QueryConstraint } from 'firebase/firestore';
import { firestoreService } from '../lib/firestore';

// Hook for getting a single document
export function useDocument<T = any>(collectionName: string, docId: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = firestoreService.onDocumentSnapshot(
      collectionName,
      docId,
      (docData) => {
        setData(docData);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, docId]);

  return { data, loading, error };
}

// Hook for getting a collection
export function useCollection<T = any>(collectionName: string, ...constraints: QueryConstraint[]) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = firestoreService.onCollectionSnapshot(
      collectionName,
      (collectionData) => {
        setData(collectionData);
        setLoading(false);
      },
      ...constraints
    );

    return unsubscribe;
  }, [collectionName, ...constraints]);

  return { data, loading, error };
}

// Hook for Firestore operations
export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDocument = async (collectionName: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const docId = await firestoreService.createDocument(collectionName, data);
      return docId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      await firestoreService.updateDocument(collectionName, docId, data);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    try {
      setLoading(true);
      setError(null);
      await firestoreService.deleteDocument(collectionName, docId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (collectionName: string, docId: string) => {
    try {
      setLoading(true);
      setError(null);
      const doc = await firestoreService.getDocument(collectionName, docId);
      return doc;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCollection = async (collectionName: string, ...constraints: QueryConstraint[]) => {
    try {
      setLoading(true);
      setError(null);
      const docs = await firestoreService.getCollection(collectionName, ...constraints);
      return docs;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getCollection
  };
}
