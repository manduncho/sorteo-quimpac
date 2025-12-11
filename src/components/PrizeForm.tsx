'use client';

import { useState, useCallback } from 'react';
import { fileToBase64, isValidImageFile } from '@/utils/imageConverter';
import type { PrizeFormData } from '@/types';

interface PrizeFormProps {
  prizes: PrizeFormData[];
  onPrizesChange: (prizes: PrizeFormData[]) => void;
}

export default function PrizeForm({ prizes, onPrizesChange }: PrizeFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addPrize = useCallback(() => {
    const newPrize: PrizeFormData = {
      id: `prize-${Date.now()}`,
      name: '',
      quantity: 1,
      imageFile: null,
      imagePreview: '',
    };
    onPrizesChange([...prizes, newPrize]);
  }, [prizes, onPrizesChange]);

  const removePrize = useCallback((id: string) => {
    onPrizesChange(prizes.filter(p => p.id !== id));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, [prizes, onPrizesChange]);

  const updatePrize = useCallback((id: string, field: keyof PrizeFormData, value: string | number | File | null) => {
    onPrizesChange(
      prizes.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  }, [prizes, onPrizesChange]);

  const handleImageChange = useCallback(async (id: string, file: File | null) => {
    if (!file) return;

    if (!isValidImageFile(file)) {
      setErrors(prev => ({
        ...prev,
        [id]: 'Solo se permiten imágenes JPG, JPEG o PNG',
      }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });

    try {
      const base64 = await fileToBase64(file);
      onPrizesChange(
        prizes.map(p => p.id === id ? { ...p, imageFile: file, imagePreview: base64 } : p)
      );
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [id]: 'Error al cargar la imagen',
      }));
    }
  }, [prizes, onPrizesChange]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-white">Tipos de Premios</h3>
        <button
          type="button"
          onClick={addPrize}
          className="btn-secondary flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar Premio
        </button>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-3">
        {prizes.length === 0 ? (
          <div className="text-center py-12 text-white/50 text-xl">
            No hay premios configurados. Haz clic en &quot;Agregar Premio&quot; para comenzar.
          </div>
        ) : (
          prizes.map((prize, index) => (
            <div
              key={prize.id}
              className="card flex items-start gap-5 p-5"
            >
              {/* Prize Number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f3b677] flex items-center justify-center text-black font-bold text-lg">
                {index + 1}
              </div>

              {/* Prize Name */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-lg text-white/70 mb-2">Nombre del Premio</label>
                <input
                  type="text"
                  value={prize.name}
                  onChange={(e) => updatePrize(prize.id, 'name', e.target.value)}
                  placeholder="Ej: Televisor 55 pulgadas"
                  className="input-field"
                />
              </div>

              {/* Quantity */}
              <div className="flex-shrink-0 w-28">
                <label className="block text-lg text-white/70 mb-2">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={prize.quantity}
                  onChange={(e) => updatePrize(prize.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  className="input-field text-center"
                />
              </div>

              {/* Image Upload */}
              <div className="flex-shrink-0 w-56">
                <label className="block text-lg text-white/70 mb-2">Imagen</label>
                <div className="flex items-center gap-3">
                  {prize.imagePreview ? (
                    <div className="relative w-14 h-14 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={prize.imagePreview}
                        alt={prize.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="file-input-wrapper flex-1">
                    <button className="btn-outline py-3 px-4 w-full text-base">
                      {prize.imagePreview ? 'Cambiar' : 'Seleccionar'}
                    </button>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleImageChange(prize.id, e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                {errors[prize.id] && (
                  <p className="text-red-400 text-sm mt-2">{errors[prize.id]}</p>
                )}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removePrize(prize.id)}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-400 transition-colors mt-6"
                title="Eliminar premio"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
