import * as React from "react";
import { 
  collection, query, onSnapshot, orderBy, addDoc, 
  updateDoc, doc, arrayUnion, arrayRemove, increment,
  limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/src/firebase";
import { useAuth } from "../auth/AuthContext";
import { Post, TradeComment } from "@/src/types";

interface CommunityContextType {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  addPost: (content: string, imageURL?: string) => Promise<void>;
  updatePost: (postId: string, content: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  getComments: (postId: string) => Promise<TradeComment[]>;
  addComment: (postId: string, content: string) => Promise<void>;
}

const PAGE_SIZE = 10;

const CommunityContext = React.createContext<CommunityContextType>({
  posts: [],
  loading: true,
  hasMore: false,
  loadMore: async () => {},
  addPost: async () => {},
  updatePost: async () => {},
  deletePost: async () => {},
  toggleLike: async () => {},
  likePost: async () => {},
  getComments: async () => [],
  addComment: async () => {},
});

const DEMO_POSTS: Post[] = [
  {
    id: 'demo-1',
    userId: 'demo-user-1',
    userName: 'Arjun Sharma',
    userPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    content: 'Just closed a massive long on NIFTY! The breakout was textbook. 🚀 #Trading #Nifty50',
    likes: ['user-1', 'user-2', 'user-3'],
    commentsCount: 5,
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    trade: {
      id: 't1',
      symbol: 'NIFTY',
      direction: 'Long',
      status: 'Win',
      netPL: 15400,
    } as any
  },
  {
    id: 'demo-2',
    userId: 'demo-user-2',
    userName: 'Priya Patel',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    content: 'Patience is key. Waited all morning for this setup on BankNifty. Discipline pays off! 💎🙌',
    likes: ['user-4', 'user-5'],
    commentsCount: 2,
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    trade: {
      id: 't2',
      symbol: 'BANKNIFTY',
      direction: 'Long',
      status: 'Win',
      netPL: 8200,
    } as any
  },
  {
    id: 'demo-3',
    userId: 'demo-user-3',
    userName: 'Rahul Verma',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    content: 'Rough day in the markets. Got stopped out on Reliance. Sticking to my risk management rules though. Tomorrow is another day. 📉',
    likes: ['user-6'],
    commentsCount: 8,
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    trade: {
      id: 't3',
      symbol: 'RELIANCE',
      direction: 'Long',
      status: 'Loss',
      netPL: -3500,
    } as any
  },
  {
    id: 'demo-4',
    userId: 'demo-user-4',
    userName: 'Ananya Iyer',
    userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    content: 'Crypto markets are looking bullish tonight! ETH breaking through resistance. Anyone else riding this wave? 🌊🚀',
    likes: ['user-7', 'user-8', 'user-9', 'user-10'],
    commentsCount: 12,
    createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    trade: {
      id: 't4',
      symbol: 'ETH/USDT',
      direction: 'Long',
      status: 'Win',
      netPL: 450,
    } as any
  },
  {
    id: 'demo-5',
    userId: 'demo-user-5',
    userName: 'Vikram Singh',
    userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    content: 'Scalping the morning volatility. 5 quick trades, 4 wins. Done for the day. Discipline > Greed. 🧘‍♂️',
    likes: ['user-11', 'user-12'],
    commentsCount: 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    trade: {
      id: 't5',
      symbol: 'HDFCBANK',
      direction: 'Long',
      status: 'Win',
      netPL: 2100,
    } as any
  }
];

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastDoc, setLastDoc] = React.useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = React.useState(true);

  const fetchPosts = React.useCallback(async (isNextPage = false) => {
    if (!user) return;
    
    const path = "posts";
    try {
      let q = query(
        collection(db, path),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );

      if (isNextPage && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      let finalPosts = fetchedPosts;
      
      // If first page and no posts, add demo posts
      if (!isNextPage && fetchedPosts.length === 0) {
        finalPosts = DEMO_POSTS;
      } else if (!isNextPage && fetchedPosts.length > 0) {
        // Merge demo posts at the bottom for initial experience if needed
        // finalPosts = [...fetchedPosts, ...DEMO_POSTS];
      }

      if (isNextPage) {
        setPosts(prev => [...prev, ...fetchedPosts]);
      } else {
        setPosts(finalPosts);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Fallback to demo posts on error (e.g. permission denied or empty)
      if (!isNextPage) setPosts(DEMO_POSTS);
    } finally {
      setLoading(false);
    }
  }, [user, lastDoc]);

  React.useEffect(() => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    setLoading(true);
    fetchPosts();
  }, [user]);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    await fetchPosts(true);
  };

  const addPost = async (content: string, imageURL?: string) => {
    if (!user || !profile) return;
    const path = "posts";
    try {
      const docRef = await addDoc(collection(db, path), {
        userId: user.uid,
        userName: profile.fullName,
        userPhoto: profile.photoURL || null,
        content,
        imageURL: imageURL || null,
        likes: [],
        commentsCount: 0,
        createdAt: Date.now(),
      });
      
      // Optimistically add to top
      const newPost: Post = {
        id: docRef.id,
        userId: user.uid,
        userName: profile.fullName,
        userPhoto: profile.photoURL || null,
        content,
        imageURL: imageURL || null,
        likes: [],
        commentsCount: 0,
        createdAt: Date.now(),
      };
      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updatePost = async (postId: string, content: string) => {
    if (!user) return;
    const path = `posts/${postId}`;
    try {
      await updateDoc(doc(db, "posts", postId), {
        content,
        updatedAt: Date.now(),
      });
      
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content } : p));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    const path = `posts/${postId}`;
    try {
      // In a real app, you might want to delete comments too, 
      // but for now we'll just delete the post or mark it as deleted.
      // For simplicity, we'll just remove it from the list if it's a demo post,
      // or delete from Firestore if it's a real post.
      if (!postId.startsWith('demo-')) {
        // We don't have a deleteDoc import yet, let's add it if needed or just use updateDoc to mark as deleted
        // Actually, let's just use updateDoc to mark as hidden/deleted for safety
        await updateDoc(doc(db, "posts", postId), {
          deleted: true,
          deletedAt: Date.now(),
        });
      }
      
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const path = `posts/${postId}`;
    const isLiked = post.likes.includes(user.uid);
    
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      likes: isLiked ? p.likes.filter(id => id !== user.uid) : [...p.likes, user.uid]
    } : p));

    try {
      await updateDoc(doc(db, "posts", postId), {
        likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      // Rollback on error
      setPosts(prev => prev.map(p => p.id === postId ? post : p));
    }
  };

  const getComments = async (postId: string): Promise<TradeComment[]> => {
    const path = `posts/${postId}/comments`;
    try {
      const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TradeComment[];

      if (fetchedComments.length === 0 && postId.startsWith('demo-')) {
        // Return demo comments for demo posts
        const demoComments: TradeComment[] = [
          {
            id: `c-${postId}-1`,
            postId,
            userId: 'u1',
            userName: 'Suresh Kumar',
            content: 'Great trade! What was your risk per trade on this one?',
            createdAt: Date.now() - 1000 * 60 * 15
          },
          {
            id: `c-${postId}-2`,
            postId,
            userId: 'u2',
            userName: 'Meera Reddy',
            content: 'Textbook breakout indeed. I missed this one, but glad you caught it!',
            createdAt: Date.now() - 1000 * 60 * 5
          }
        ];
        return demoComments;
      }
      return fetchedComments;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user || !profile) return;
    const path = `posts/${postId}/comments`;
    try {
      await addDoc(collection(db, "posts", postId, "comments"), {
        postId,
        userId: user.uid,
        userName: profile.fullName,
        content,
        createdAt: Date.now(),
      });
      
      await updateDoc(doc(db, "posts", postId), {
        commentsCount: increment(1)
      });

      setPosts(prev => prev.map(p => p.id === postId ? {
        ...p,
        commentsCount: (p.commentsCount || 0) + 1
      } : p));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <CommunityContext.Provider value={{ 
      posts, 
      loading, 
      hasMore, 
      loadMore, 
      addPost, 
      updatePost,
      deletePost,
      toggleLike, 
      likePost: toggleLike,
      getComments,
      addComment
    }}>
      {children}
    </CommunityContext.Provider>
  );
}

export const useCommunity = () => React.useContext(CommunityContext);
