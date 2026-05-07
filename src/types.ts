export type MarketType = 'Stocks' | 'Options' | 'Futures' | 'Forex' | 'Crypto';
export type Direction = 'Long' | 'Short';
export type Emotion = 'Calm' | 'Anxious' | 'Greedy' | 'Fearful' | 'Confident' | 'Neutral';
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type TraderType = 'Intraday' | 'Swing' | 'Scalper' | 'Positional' | 'Options' | 'Futures' | 'Crypto';

export type UserPlan = 'FREE' | 'PRO' | 'ELITE';

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  city: string;
  photoURL?: string;
  traderTypes: TraderType[];
  marketPreferences: MarketType[];
  experienceLevel: ExperienceLevel;
  goals: string[];
  currency: string;
  language?: 'en-US' | 'en-IN' | 'hinglish' | 'hi-IN';
  theme?: 'light' | 'dark';
  floatingChatbotEnabled?: boolean;
  onboardingCompleted: boolean;
  plan: UserPlan;
  subscriptionStatus: 'active' | 'expired' | 'canceled';
  subscriptionExpiry?: number;
  createdAt: number;
}

export interface Trade {
  id: string;
  userId: string;
  marketType: MarketType;
  symbol: string;
  direction: Direction;
  setupType: string;
  setup?: string; // For backward compatibility or alternative naming
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  targetPrice: number;
  quantity: number;
  riskAmount: number;
  rrRatio: number;
  leverage: number;
  margin: number;
  fees: number;
  currency: string;
  notes: string;
  date: string; // Entry ISO date string
  time: string; // Entry time
  exitDate?: string; // Exit ISO date string
  exitTime?: string; // Exit time
  emotionBefore: Emotion;
  emotionAfter: Emotion;
  confidence: number;
  ruleFollowed: boolean;
  screenshotURL?: string;
  tags: string[];
  grossPL: number;
  netPL: number;
  roi: number;
  status: 'Win' | 'Loss' | 'Breakeven';
  isDraft?: boolean;
  mistakes?: string;
  learnings?: string;
  createdAt: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  imageURL?: string;
  likes: string[];
  commentsCount: number;
  createdAt: number;
  trade?: Trade; // Optional trade attachment
}

export interface TradeComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  name?: string;
  photo?: string;
  lastMessage: string;
  lastMessageTime?: number;
  lastTimestamp: number;
  unreadCount: { [userId: string]: number };
}
