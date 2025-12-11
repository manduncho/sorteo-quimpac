'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLotteryStore } from '@/store/lotteryStore';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { exportWinnersToPDF } from '@/utils/pdfExporter';
import FullscreenButton from '@/components/FullscreenButton';
import ConfirmModal from '@/components/ConfirmModal';
import type { Winner } from '@/types';

export default function WinnersPage() {
  const router = useRouter();
  const {
    winners,
    isConfigured,
    resetLottery,
    setCurrentPage,
  } = useLotteryStore();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Set current page on mount
  useEffect(() => {
    if (isHydrated && isConfigured) {
      setCurrentPage('winners');
    }
  }, [isHydrated, isConfigured, setCurrentPage]);

  // Guard: Redirect if not configured
  useEffect(() => {
    if (isHydrated && !isConfigured) {
      router.push('/');
    }
  }, [isHydrated, isConfigured, router]);

  const handleReset = useCallback(() => {
    resetLottery();
    setShowResetModal(false);
    router.push('/');
  }, [resetLottery, router]);

  const handleExportPDF = useCallback(() => {
    if (winners.length > 0) {
      exportWinnersToPDF(winners);
    }
  }, [winners]);

  // F9 keyboard shortcut for reset
  useKeyboardShortcut('F9', () => setShowResetModal(true), true);

  // Group winners by prize
  const winnersByPrize = winners.reduce<Record<string, Winner[]>>((acc, winner) => {
    if (!acc[winner.prizeName]) {
      acc[winner.prizeName] = [];
    }
    acc[winner.prizeName].push(winner);
    return acc;
  }, {});

  // Sort prize names by first winner timestamp (to maintain order of prizes drawn)
  const sortedPrizeNames = Object.keys(winnersByPrize).sort((a, b) => {
    const aFirst = winnersByPrize[a][0]?.timestamp || 0;
    const bFirst = winnersByPrize[b][0]?.timestamp || 0;
    return aFirst - bFirst;
  });

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
          <h1 className="text-5xl font-bold text-[#f3b677]">🎉 Ganadores del Sorteo</h1>
          <p className="text-white/60 mt-3 text-xl">
            {winners.length} ganador{winners.length !== 1 ? 'es' : ''} en total
          </p>
        </div>
        <div className="flex items-center gap-6">
          <FullscreenButton />
        </div>
      </header>

      {/* Winners List */}
      <div className="flex-1 overflow-y-auto pr-6">
        {winners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-8xl mb-6">🎁</div>
            <h2 className="text-3xl font-bold text-white mb-3">No hay ganadores aún</h2>
            <p className="text-white/60 text-xl">Completa el sorteo para ver los ganadores aquí</p>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedPrizeNames.map((prizeName) => (
              <div key={prizeName} className="card">
                {/* Prize Header */}
                <div className="sticky top-0 bg-[#b40e26] text-white py-4 px-8 rounded-t-lg -mx-7 -mt-7 mb-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{prizeName}</h2>
                    <span className="bg-white/20 px-4 py-2 rounded-full text-lg">
                      {winnersByPrize[prizeName].length} ganador{winnersByPrize[prizeName].length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>

                {/* Winners Grid */}
                <div className="grid grid-cols-4 gap-6">
                  {winnersByPrize[prizeName].map((winner, index) => (
                    <div
                      key={winner.id}
                      className="bg-white/5 rounded-lg p-5 border border-white/10 hover:border-[#f3b677]/50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f3b677] flex items-center justify-center text-black font-bold text-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-xl truncate" title={winner.fullName}>
                            {winner.fullName}
                          </h3>
                          <p className="text-white/60 text-lg truncate" title={winner.position}>
                            {winner.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with buttons */}
      <div className="mt-8 flex justify-center gap-6">
        {winners.length > 0 && (
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-3 text-xl py-5 px-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar PDF
          </button>
        )}
        <button
          onClick={() => setShowResetModal(true)}
          className="btn-outline text-xl py-5 px-10"
        >
          Reiniciar Sorteo (F9)
        </button>
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
