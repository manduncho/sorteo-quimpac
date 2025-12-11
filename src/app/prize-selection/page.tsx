'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLotteryStore } from '@/store/lotteryStore';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import FullscreenButton from '@/components/FullscreenButton';
import ConfirmModal from '@/components/ConfirmModal';

export default function PrizeSelectionPage() {
  const router = useRouter();
  const {
    participants,
    prizes,
    isConfigured,
    setSelectedPrize,
    setCurrentPage,
    resetLottery,
    getAvailablePrizes,
  } = useLotteryStore();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Guard: Redirect if not configured or no participants
  useEffect(() => {
    if (isHydrated) {
      if (!isConfigured || participants.length === 0 || prizes.length === 0) {
        router.push('/');
        return;
      }

      // Check if all prizes are exhausted
      const availablePrizes = getAvailablePrizes();
      if (availablePrizes.length === 0) {
        setCurrentPage('winners');
        router.push('/winners');
      }
    }
  }, [isHydrated, isConfigured, participants, prizes, router, getAvailablePrizes, setCurrentPage]);

  const handlePrizeSelect = useCallback((prizeId: string) => {
    setSelectedPrize(prizeId);
    setCurrentPage('lottery');
    router.push('/lottery');
  }, [setSelectedPrize, setCurrentPage, router]);

  const handleReset = useCallback(() => {
    resetLottery();
    setShowResetModal(false);
    router.push('/');
  }, [resetLottery, router]);

  // F9 keyboard shortcut for reset
  useKeyboardShortcut('F9', () => setShowResetModal(true), true);

  const availablePrizes = getAvailablePrizes();

  if (!isHydrated) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/50">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-5xl font-bold text-[#f3b677]">Seleccionar Premio</h1>
          <p className="text-white/60 mt-3 text-xl">
            Quedan {participants.length} participantes | {availablePrizes.length} tipos de premios disponibles
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowResetModal(true)}
            className="btn-outline"
          >
            Reiniciar (F9)
          </button>
          <FullscreenButton />
        </div>
      </header>

      {/* Prize Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-8">
          {availablePrizes.map((prize) => (
            <button
              key={prize.id}
              onClick={() => handlePrizeSelect(prize.id)}
              className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#f3b677]/30 focus:outline-none focus:ring-2 focus:ring-[#f3b677]"
            >
              {/* Prize Image */}
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={prize.imageBase64}
                  alt={prize.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Prize Info */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2">
                  {prize.name}
                </h3>
                <div className="inline-flex items-center gap-2 bg-[#f3b677] text-black px-4 py-2 rounded-full text-lg font-semibold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </svg>
                  {prize.quantity} disponible{prize.quantity !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Hover border effect */}
              <div className="absolute inset-0 border-4 border-transparent group-hover:border-[#f3b677] rounded-xl transition-colors duration-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-center text-white/40 text-lg">
        Haz clic en un premio para iniciar el sorteo • Presiona F9 para reiniciar
      </div>

      {/* Reset Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}
