'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-[#2d0a0a] border border-[#f3b677]/30 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl font-bold text-center text-white mb-2">
          Confirmar Reinicio
        </h2>
        <p className="text-center text-white/80 mb-8">
          ¿Está seguro de reiniciar el sorteo? Se perderán todos los datos actuales.
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 btn-outline"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 btn-primary bg-red-500 hover:bg-red-600"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
