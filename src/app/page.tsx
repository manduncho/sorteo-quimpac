'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLotteryStore } from '@/store/lotteryStore';
import { parseCSV } from '@/utils/csvParser';
import FullscreenButton from '@/components/FullscreenButton';
import ConfirmModal from '@/components/ConfirmModal';
import PrizeForm from '@/components/PrizeForm';
import type { PrizeFormData, Prize } from '@/types';

export default function ConfigPage() {
  const router = useRouter();
  const {
    participants,
    setParticipants,
    setPrizes,
    isConfigured,
    currentPage,
    resetLottery,
  } = useLotteryStore();

  const [prizes, setPrizesLocal] = useState<PrizeFormData[]>([]);
  const [csvMessage, setCsvMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Auto-redirect if already configured
  useEffect(() => {
    if (isHydrated && isConfigured && currentPage !== 'config') {
      router.push(`/${currentPage === 'prize-selection' ? 'prize-selection' : currentPage === 'lottery' ? 'lottery' : 'winners'}`);
    }
  }, [isHydrated, isConfigured, currentPage, router]);

  const handleCSVUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await parseCSV(file);
    
    if (result.success) {
      setParticipants(result.participants);
      setCsvMessage({
        type: 'success',
        text: `Éxito: ${result.participants.length} participantes cargados`,
      });
    } else {
      setCsvMessage({
        type: 'error',
        text: result.error || 'Error desconocido',
      });
    }

    // Reset input
    event.target.value = '';
  }, [setParticipants]);

  const handleStartLottery = useCallback(() => {
    // Validate
    if (participants.length === 0) {
      setCsvMessage({ type: 'error', text: 'Error: Debe cargar participantes' });
      return;
    }

    if (prizes.length === 0) {
      setCsvMessage({ type: 'error', text: 'Error: Debe configurar al menos un premio' });
      return;
    }

    // Validate all prizes have required data
    const invalidPrizes = prizes.filter(p => !p.name.trim() || !p.imagePreview);
    if (invalidPrizes.length > 0) {
      setCsvMessage({ type: 'error', text: 'Error: Todos los premios deben tener nombre e imagen' });
      return;
    }

    // Convert PrizeFormData to Prize
    const storePrizes: Prize[] = prizes.map(p => ({
      id: p.id,
      name: p.name.trim(),
      quantity: p.quantity,
      initialQuantity: p.quantity,
      imageBase64: p.imagePreview,
    }));

    // Save to store
    setPrizes(storePrizes);
    useLotteryStore.getState().setIsConfigured(true);
    useLotteryStore.getState().setCurrentPage('prize-selection');

    // Navigate
    router.push('/prize-selection');
  }, [participants, prizes, setPrizes, router]);

  const handleReset = useCallback(() => {
    resetLottery();
    setPrizesLocal([]);
    setCsvMessage(null);
    setShowResetModal(false);
  }, [resetLottery]);

  const canStart = participants.length > 0 && prizes.length > 0 && prizes.every(p => p.name.trim() && p.imagePreview);

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
        <h1 className="text-5xl font-bold text-[#f3b677]">Sorteo Quimpac</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowResetModal(true)}
            className="btn-outline"
          >
            Reiniciar Sistema
          </button>
          <FullscreenButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-12 overflow-hidden">
        {/* Left Column - CSV Upload & Participants Preview */}
        <div className="flex-1 flex flex-col">
          {/* CSV Upload */}
          <div className="card mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Cargar Participantes</h2>
            <p className="text-white/60 text-lg mb-6">
              Sube un archivo CSV con dos columnas: Nombre Completo y Cargo
            </p>
            
            <div className="flex items-center gap-6">
              <div className="file-input-wrapper">
                <button className="btn-primary">
                  Seleccionar archivo CSV
                </button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                />
              </div>
              
              {csvMessage && (
                <span className={`text-lg ${csvMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {csvMessage.text}
                </span>
              )}
            </div>
          </div>

          {/* Participants Preview */}
          <div className="card flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Participantes</h2>
              <span className="text-white/60 text-lg">
                {participants.length} participantes cargados
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {participants.length === 0 ? (
                <div className="text-center py-12 text-white/50 text-xl">
                  No hay participantes cargados
                </div>
              ) : (
                <table className="w-full text-lg">
                  <thead className="sticky top-0 bg-[#2d0a0a]">
                    <tr className="text-left text-white/70">
                      <th className="pb-3 pr-6">#</th>
                      <th className="pb-3 pr-6">Nombre Completo</th>
                      <th className="pb-3">Cargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.slice(0, 100).map((participant, index) => (
                      <tr key={participant.id} className="text-white/90 border-t border-white/10">
                        <td className="py-3 pr-6 text-white/50">{index + 1}</td>
                        <td className="py-3 pr-6">{participant.fullName}</td>
                        <td className="py-3">{participant.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {participants.length > 100 && (
                <div className="text-center py-6 text-white/50 text-lg">
                  Mostrando 100 de {participants.length} participantes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Prizes */}
        <div className="flex-1 flex flex-col">
          <div className="card flex-1 overflow-hidden flex flex-col">
            <PrizeForm prizes={prizes} onPrizesChange={setPrizesLocal} />
          </div>

          {/* Start Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleStartLottery}
              disabled={!canStart}
              className="btn-secondary text-2xl py-5 px-16"
            >
              Iniciar Sorteo
            </button>
          </div>
        </div>
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
