'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLotteryStore } from '@/store/lotteryStore';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import ConfirmModal from '@/components/ConfirmModal';
import type { Participant, Winner } from '@/types';

// Calculate font size based on text length (increased 20%)
function calculateFontSize(text: string, isName: boolean): number {
  const length = text.length;
  
  if (isName) {
    // Name: 15-40 characters (20% larger)
    if (length <= 15) return 86;
    if (length <= 20) return 77;
    if (length <= 25) return 67;
    if (length <= 30) return 58;
    if (length <= 35) return 50;
    return 43;
  } else {
    // Position: 7-58 characters (20% larger)
    if (length <= 10) return 58;
    if (length <= 20) return 48;
    if (length <= 30) return 41;
    if (length <= 40) return 34;
    if (length <= 50) return 29;
    return 24;
  }
}

// Easing function for smooth animation
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function LotteryPage() {
  const router = useRouter();
  const {
    participants,
    isConfigured,
    selectedPrizeId,
    getSelectedPrize,
    addWinner,
    removeParticipant,
    decrementPrizeQuantity,
    setCurrentPage,
    resetLottery,
    getAvailablePrizes,
  } = useLotteryStore();

  const [showResetModal, setShowResetModal] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [showColorTransition, setShowColorTransition] = useState(false);
  const [showZoomAnimation, setShowZoomAnimation] = useState(false);

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const selectedPrize = getSelectedPrize();

  // Hydration check
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Guard: Redirect if not configured or no selected prize
  useEffect(() => {
    if (isHydrated) {
      if (!isConfigured || !selectedPrizeId || participants.length === 0) {
        router.push('/');
        return;
      }
    }
  }, [isHydrated, isConfigured, selectedPrizeId, participants, router]);

  // Animation logic - using predetermined schedule for smooth deceleration
  const runAnimation = useCallback(() => {
    const ANIMATION_DURATION = 10000; // 10 seconds
    const FAST_PHASE_DURATION = 7000; // 7 seconds of fast animation
    const DECEL_PHASE_DURATION = 3000; // 3 seconds of deceleration
    const MIN_INTERVAL = 35; // Minimum ms between changes (fast phase)
    
    // Pre-calculate all change times for smooth, predictable animation
    const changeTimes: number[] = [];
    let currentTime = 0;
    
    // Fast phase: constant interval
    while (currentTime < FAST_PHASE_DURATION) {
      changeTimes.push(currentTime);
      currentTime += MIN_INTERVAL;
    }
    
    // Deceleration phase: progressively slower
    // Use exponential slowdown for natural feel
    const decelSteps = 12; // Number of name changes during deceleration
    for (let i = 0; i < decelSteps; i++) {
      const stepProgress = i / decelSteps;
      // Exponential curve: starts slow increase, ends with big gaps
      const stepTime = FAST_PHASE_DURATION + (DECEL_PHASE_DURATION * Math.pow(stepProgress, 1.8));
      changeTimes.push(stepTime);
    }
    
    let changeIndex = 0;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      
      // Check if it's time for the next change
      if (changeIndex < changeTimes.length && elapsed >= changeTimes[changeIndex]) {
        // Pick a random participant
        const randomIndex = Math.floor(Math.random() * participants.length);
        setCurrentParticipant(participants[randomIndex]);
        changeIndex++;
      }

      if (elapsed < ANIMATION_DURATION) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - select winner
        const winnerIndex = Math.floor(Math.random() * participants.length);
        const selectedWinner = participants[winnerIndex];
        setWinner(selectedWinner);
        setCurrentParticipant(selectedWinner);
        setIsAnimating(false);
        
        // Timeline:
        // 0s: Winner shown (still with red background)
        // 1s: Start color transition (1 second)
        // 2s: Color transition complete, stay still (1 second)
        // 3s: Start zoom animation (1 second)
        // 4s: All animations complete, show continue button
        
        // Show color transition after 1 second delay
        setTimeout(() => {
          setShowColorTransition(true);
        }, 1000);
        
        // Show zoom animation after 3 seconds delay (1s wait + 1s color + 1s still)
        setTimeout(() => {
          setShowZoomAnimation(true);
        }, 3000);
        
        // Show continue button after all animations complete (4 seconds total)
        setTimeout(() => {
          setShowContinueButton(true);
        }, 4000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [participants]);

  const startAnimation = useCallback(() => {
    if (participants.length === 0) return;
    
    setIsAnimating(true);
    setAnimationStarted(true);
    setWinner(null);
    setShowContinueButton(false);
    setShowColorTransition(false);
    setShowZoomAnimation(false);
    startTimeRef.current = 0;
    
    // Pick initial participant
    const randomIndex = Math.floor(Math.random() * participants.length);
    setCurrentParticipant(participants[randomIndex]);
    
    runAnimation();
  }, [participants, runAnimation]);

  // Handle continue to next selection
  const handleContinue = useCallback(() => {
    if (!winner || !selectedPrize) return;

    // Create winner record
    const winnerRecord: Winner = {
      id: `winner-${Date.now()}`,
      participantId: winner.id,
      fullName: winner.fullName,
      position: winner.position,
      prizeId: selectedPrize.id,
      prizeName: selectedPrize.name,
      timestamp: Date.now(),
    };

    // Update store
    addWinner(winnerRecord);
    removeParticipant(winner.id);
    decrementPrizeQuantity(selectedPrize.id);

    // Check if there are more prizes
    const availablePrizes = getAvailablePrizes();
    
    if (availablePrizes.length > 0 && participants.length > 1) {
      setCurrentPage('prize-selection');
      router.push('/prize-selection');
    } else {
      setCurrentPage('winners');
      router.push('/winners');
    }
  }, [winner, selectedPrize, addWinner, removeParticipant, decrementPrizeQuantity, getAvailablePrizes, setCurrentPage, router, participants]);

  // F8 for re-draw (only if not animating and winner is selected)
  const handleReDraw = useCallback(() => {
    if (!isAnimating && winner) {
      setWinner(null);
      setShowContinueButton(false);
      startAnimation();
    }
  }, [isAnimating, winner, startAnimation]);

  useKeyboardShortcut('F8', handleReDraw, !isAnimating && !!winner);
  useKeyboardShortcut('F9', () => setShowResetModal(true), true);

  // Handle click to start animation or continue
  const handleClick = useCallback(() => {
    if (!animationStarted && !isAnimating) {
      startAnimation();
    } else if (!isAnimating && winner) {
      handleContinue();
    }
  }, [animationStarted, isAnimating, winner, startAnimation, handleContinue]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleReset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    resetLottery();
    setShowResetModal(false);
    router.push('/');
  }, [resetLottery, router]);

  if (!isHydrated || !selectedPrize) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white/50">Cargando...</div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full relative cursor-pointer"
      onClick={handleClick}
      style={{
        backgroundImage: `url(${selectedPrize.imageBase64})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Animation Container - Centered */}
      {currentParticipant && (
        <div 
          className={`absolute bottom-[20%] left-0 right-0 flex flex-col items-center z-10 ${showZoomAnimation ? 'animate-winner-zoom' : ''}`}
        >
          {/* Name */}
          <span 
            className={`animation-name-box ${showColorTransition ? 'animate-color-transition' : ''}`}
            style={{ 
              fontSize: `${calculateFontSize(currentParticipant.fullName, true)}px`,
              lineHeight: 1.2,
            }}
          >
            {currentParticipant.fullName}
          </span>
          
          {/* Position */}
          <span 
            className={`animation-position-box ${showColorTransition ? 'animate-position-color-transition' : ''}`}
            style={{ 
              fontSize: `${calculateFontSize(currentParticipant.position, false)}px`,
              lineHeight: 1.3,
            }}
          >
            {currentParticipant.position}
          </span>
        </div>
      )}

      {/* Reset Modal */}
      <ConfirmModal
        isOpen={showResetModal}
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}
