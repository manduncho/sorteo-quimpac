'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LotteryState, Participant, Prize, Winner, CurrentPage } from '@/types';

const initialState = {
  participants: [] as Participant[],
  prizes: [] as Prize[],
  winners: [] as Winner[],
  selectedPrizeId: null as string | null,
  currentPage: 'config' as CurrentPage,
  isConfigured: false,
};

// Custom storage with fallback
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      try {
        return sessionStorage.getItem(name);
      } catch {
        return null;
      }
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      try {
        sessionStorage.setItem(name, value);
      } catch {
        console.warn('Storage not available, data will be lost on refresh');
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      try {
        sessionStorage.removeItem(name);
      } catch {
        // Ignore
      }
    }
  },
};

export const useLotteryStore = create<LotteryState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setParticipants: (participants: Participant[]) => {
        set({ participants });
      },

      addPrize: (prize: Prize) => {
        set((state) => ({
          prizes: [...state.prizes, prize],
        }));
      },

      updatePrize: (id: string, updatedPrize: Partial<Prize>) => {
        set((state) => ({
          prizes: state.prizes.map((prize) =>
            prize.id === id ? { ...prize, ...updatedPrize } : prize
          ),
        }));
      },

      removePrize: (id: string) => {
        set((state) => ({
          prizes: state.prizes.filter((prize) => prize.id !== id),
        }));
      },

      setPrizes: (prizes: Prize[]) => {
        set({ prizes });
      },

      addWinner: (winner: Winner) => {
        set((state) => ({
          winners: [...state.winners, winner],
        }));
      },

      removeParticipant: (participantId: string) => {
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== participantId),
        }));
      },

      setSelectedPrize: (prizeId: string | null) => {
        set({ selectedPrizeId: prizeId });
      },

      setCurrentPage: (page: CurrentPage) => {
        set({ currentPage: page });
      },

      decrementPrizeQuantity: (prizeId: string) => {
        set((state) => ({
          prizes: state.prizes.map((prize) =>
            prize.id === prizeId
              ? { ...prize, quantity: Math.max(0, prize.quantity - 1) }
              : prize
          ),
        }));
      },

      setIsConfigured: (configured: boolean) => {
        set({ isConfigured: configured });
      },

      resetLottery: () => {
        set({ ...initialState });
        try {
          localStorage.removeItem('lottery-storage');
          sessionStorage.removeItem('lottery-storage');
        } catch {
          // Ignore storage errors
        }
      },

      getAvailablePrizes: () => {
        return get().prizes.filter((prize) => prize.quantity > 0);
      },

      getSelectedPrize: () => {
        const { prizes, selectedPrizeId } = get();
        return prizes.find((prize) => prize.id === selectedPrizeId);
      },
    }),
    {
      name: 'lottery-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        participants: state.participants,
        prizes: state.prizes,
        winners: state.winners,
        selectedPrizeId: state.selectedPrizeId,
        currentPage: state.currentPage,
        isConfigured: state.isConfigured,
      }),
    }
  )
);
