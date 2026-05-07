import * as React from "react";
import { 
  collection, query, where, onSnapshot, orderBy, 
  addDoc, updateDoc, deleteDoc, doc, limit, 
  startAfter, getDocs, QueryDocumentSnapshot, DocumentData
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { useAuth } from "../auth/AuthContext";
import { Trade } from "@/src/types";

interface TradeContextType {
  trades: Trade[];
  allTrades: Trade[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  addTrade: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Trade>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  refreshTrades: () => Promise<void>;
  fetchAllTrades: () => Promise<Trade[]>;
}

const PAGE_SIZE = 20;

const TradeContext = React.createContext<TradeContextType>({
  trades: [],
  allTrades: [],
  loading: true,
  hasMore: false,
  loadMore: async () => {},
  addTrade: async () => {},
  updateTrade: async () => {},
  deleteTrade: async () => {},
  refreshTrades: async () => {},
  fetchAllTrades: async () => [],
});

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [trades, setTrades] = React.useState<Trade[]>([]);
  const [allTrades, setAllTrades] = React.useState<Trade[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastDoc, setLastDoc] = React.useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    if (!user) {
      setTrades([]);
      setAllTrades([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    setLoading(true);
    const path = "trades";
    
    // Real-time listener for the first page
    const qPaged = query(
      collection(db, path),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribePaged = onSnapshot(qPaged, (snapshot) => {
      const newTrades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];

      setTrades(newTrades);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    // Real-time listener for ALL trades (for Dashboard/Analytics consistency)
    const qAll = query(
      collection(db, path),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeAll = onSnapshot(qAll, (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      setAllTrades(tradesData);
    });

    return () => {
      unsubscribePaged();
      unsubscribeAll();
    };
  }, [user]);

  const loadMore = async () => {
    if (loading || !hasMore || !user || !lastDoc) return;
    
    setLoading(true);
    const path = "trades";
    try {
      const q = query(
        collection(db, path),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const moreTrades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];

      setTrades(prev => [...prev, ...moreTrades]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  const refreshTrades = async () => {
    // With onSnapshot, manual refresh is less needed for the first page,
    // but we can still trigger a full reload if required.
    // For now, onSnapshot handles the first page.
  };

  const fetchAllTrades = React.useCallback(async () => {
    if (!user) return [];
    const path = "trades";
    try {
      const q = query(
        collection(db, path),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }, [user]);

  const addTrade = async (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const path = "trades";
    try {
      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(tradeData).filter(([_, v]) => v !== undefined)
      );
      await addDoc(collection(db, path), {
        ...cleanData,
        userId: user.uid,
        createdAt: Date.now(),
      });
      // onSnapshot will handle the state update automatically
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error; // Rethrow to handle in UI
    }
  };

  const updateTrade = async (id: string, tradeData: Partial<Trade>) => {
    const path = `trades/${id}`;
    try {
      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(tradeData).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(db, "trades", id), cleanData);
      // onSnapshot might not catch updates if they are not in the first page,
      // so we still update local state for safety if it exists in our trades array
      setTrades(prev => prev.map(t => t.id === id ? { ...t, ...cleanData } : t));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  };

  const deleteTrade = async (id: string) => {
    const path = `trades/${id}`;
    try {
      await deleteDoc(doc(db, "trades", id));
      // onSnapshot will handle the first page, but we update local state too
      setTrades(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  };

  return (
    <TradeContext.Provider value={{ 
      trades, 
      allTrades,
      loading, 
      hasMore, 
      loadMore, 
      addTrade, 
      updateTrade, 
      deleteTrade,
      refreshTrades,
      fetchAllTrades
    }}>
      {children}
    </TradeContext.Provider>
  );
}

export const useTrades = () => React.useContext(TradeContext);
