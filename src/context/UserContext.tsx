'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getUserLocation } from '@/utils/affiliateLinks';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Demo users for testing different scenarios
const DEMO_USERS = {
  'demo@free.com': {
    id: 'demo-free-user',
    name: 'Demo Free User',
    email: 'demo@free.com',
    hasActiveSubscription: false,
    freeBetUsedToday: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  'demo@premium.com': {
    id: 'demo-premium-user', 
    name: 'Demo Premium User',
    email: 'demo@premium.com',
    hasActiveSubscription: true,
    freeBetUsedToday: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  }
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Use consistent localStorage key
        const savedUser = localStorage.getItem('vault-bets-user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const location = await getUserLocation();
          setUser({ ...parsedUser, location });
        }
        // Don't auto-create users anymore - require explicit login
      } catch (error) {
        console.error('Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('vault-bets-user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      // Check for demo users
      const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
      if (demoUser) {
        const location = await getUserLocation();
        setUser({ ...demoUser, location });
        return true;
      }

      // For non-demo users, simulate login process
      if (email && email.includes('@')) {
        const newUser = {
          id: crypto.randomUUID(),
          name: email.split('@')[0],
          email,
          hasActiveSubscription: false,
          freeBetUsedToday: false,
          createdAt: new Date().toISOString(),
        };
        
        const location = await getUserLocation();
        setUser({ ...newUser, location });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vault-bets-user');
  };

  return (
    <UserContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}