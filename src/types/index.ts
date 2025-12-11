// Tipos para el Sistema de Sorteo Quimpac

export interface Participant {
  id: string;
  fullName: string;
  position: string;
}

export interface Prize {
  id: string;
  name: string;
  quantity: number;
  initialQuantity: number;
  imageBase64: string;
}

export interface Winner {
  id: string;
  participantId: string;
  fullName: string;
  position: string;
  prizeId: string;
  prizeName: string;
  timestamp: number;
}

export type CurrentPage = 'config' | 'prize-selection' | 'lottery' | 'winners';

export interface LotteryState {
  // Data
  participants: Participant[];
  prizes: Prize[];
  winners: Winner[];
  
  // Current state
  selectedPrizeId: string | null;
  currentPage: CurrentPage;
  isConfigured: boolean;
  
  // Actions
  setParticipants: (participants: Participant[]) => void;
  addPrize: (prize: Prize) => void;
  updatePrize: (id: string, prize: Partial<Prize>) => void;
  removePrize: (id: string) => void;
  setPrizes: (prizes: Prize[]) => void;
  addWinner: (winner: Winner) => void;
  removeParticipant: (participantId: string) => void;
  setSelectedPrize: (prizeId: string | null) => void;
  setCurrentPage: (page: CurrentPage) => void;
  decrementPrizeQuantity: (prizeId: string) => void;
  setIsConfigured: (configured: boolean) => void;
  resetLottery: () => void;
  getAvailablePrizes: () => Prize[];
  getSelectedPrize: () => Prize | undefined;
}

// Form types for configuration
export interface PrizeFormData {
  id: string;
  name: string;
  quantity: number;
  imageFile: File | null;
  imagePreview: string;
}
