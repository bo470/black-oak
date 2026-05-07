import * as React from "react";
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, doc, or } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { useAuth } from "../auth/AuthContext";
import { Message, Conversation } from "@/src/types";

interface MessagingContextType {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  activeConversationId: string | null;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  selectConversation: (convId: string) => void;
}

const MessagingContext = React.createContext<MessagingContextType>({
  conversations: [],
  messages: [],
  loading: true,
  activeConversationId: null,
  sendMessage: async () => {},
  selectConversation: () => {},
});

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedConvId, setSelectedConvId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const path = "conversations";
    const q = query(
      collection(db, path),
      where("participants", "array-contains", user.uid),
      orderBy("lastTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      setConversations(convsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    if (!user || !selectedConvId) {
      setMessages([]);
      return;
    }

    const path = "messages";
    const q = query(
      collection(db, path),
      where("conversationId", "==", selectedConvId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user, selectedConvId]);

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;
    
    const path = "messages";
    try {
      // Simplified: In a real app, you'd find or create a conversation first
      await addDoc(collection(db, path), {
        senderId: user.uid,
        receiverId,
        content,
        timestamp: Date.now(),
        read: false,
        conversationId: selectedConvId, // This assumes a conversation is already selected
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const selectConversation = (convId: string) => {
    setSelectedConvId(convId);
  };

  return (
    <MessagingContext.Provider value={{ conversations, messages, loading, activeConversationId: selectedConvId, sendMessage, selectConversation }}>
      {children}
    </MessagingContext.Provider>
  );
}

export const useMessaging = () => React.useContext(MessagingContext);
