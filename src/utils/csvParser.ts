import Papa from 'papaparse';
import type { Participant } from '@/types';

export interface CSVParseResult {
  success: boolean;
  participants: Participant[];
  error?: string;
}

export function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Check if file is empty
        if (results.data.length === 0) {
          resolve({
            success: false,
            participants: [],
            error: 'Error: El archivo está vacío',
          });
          return;
        }

        // Get the headers
        const headers = results.meta.fields || [];
        
        // Check if we have exactly 2 columns
        if (headers.length !== 2) {
          resolve({
            success: false,
            participants: [],
            error: `Error: El archivo debe tener exactamente 2 columnas. Se encontraron ${headers.length} columnas.`,
          });
          return;
        }

        // Parse participants
        const participants: Participant[] = [];
        const [nameColumn, positionColumn] = headers;

        for (let i = 0; i < results.data.length; i++) {
          const row = results.data[i] as Record<string, string>;
          const fullName = row[nameColumn]?.trim();
          const position = row[positionColumn]?.trim();

          if (fullName && position) {
            participants.push({
              id: `participant-${i}-${Date.now()}`,
              fullName,
              position,
            });
          }
        }

        if (participants.length === 0) {
          resolve({
            success: false,
            participants: [],
            error: 'Error: No se encontraron participantes válidos en el archivo',
          });
          return;
        }

        resolve({
          success: true,
          participants,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          participants: [],
          error: `Error al procesar el archivo: ${error.message}`,
        });
      },
    });
  });
}
