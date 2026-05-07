import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './features/auth/AuthContext';
import { TradeProvider } from './features/trades/TradeContext';
import { CommunityProvider } from './features/community/CommunityContext';
import { MessagingProvider } from './features/messaging/MessagingContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TradeProvider>
        <CommunityProvider>
          <MessagingProvider>
            <App />
          </MessagingProvider>
        </CommunityProvider>
      </TradeProvider>
    </AuthProvider>
  </StrictMode>,
);
