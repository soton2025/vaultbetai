'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { getUserLocation } from '@/utils/affiliateLinks';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const savedUser = localStorage.getItem('betting-user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const location = await getUserLocation();
          setUser({ ...parsedUser, location });
        } else {
          const location = await getUserLocation();
          const newUser: User = {
            id: crypto.randomUUID(),
            email: '',
            hasActiveSubscription: true, // Enable premium for testing
            freeBetUsedToday: false,
            location,
          };
          setUser(newUser);
          localStorage.setItem('betting-user', JSON.stringify(newUser));
        }
      } catch (error) {
        console.error('Failed to initialize user:', error);
        const fallbackUser: User = {
          id: crypto.randomUUID(),
          email: '',
          hasActiveSubscription: false,
          freeBetUsedToday: false,
        };
        setUser(fallbackUser);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('betting-user', JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
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