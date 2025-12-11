# Sistema de Sorteo Quimpac

Sistema de sorteo interactivo desarrollado con Next.js para eventos corporativos de Quimpac. Permite gestionar sorteos con múltiples tipos de premios, animaciones atractivas y exportación de resultados.

## Características

- **Resolución fija**: Optimizado para pantallas de 2560x768px
- **Persistencia**: Guarda automáticamente el estado en localStorage con recuperación al recargar
- **Participantes**: Soporte para ~600 participantes mediante carga de archivo CSV
- **Premios variables**: Configuración de 2 a 20 tipos de premios con imágenes personalizadas (JPG/JPEG/PNG)
- **Animación de sorteo**: Animación de 15 segundos con efecto de aceleración/desaceleración
- **Un ganador por participante**: Cada participante solo puede ganar una vez
- **Exportación PDF**: Descarga directa de lista de ganadores como "Ganadores_Sorteo_Quimpac.pdf"
- **Controles de teclado**: F8 para re-sortear, F9 para reiniciar desde cualquier página
- **Modo pantalla completa**: Botón para activar/desactivar fullscreen

## Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Página de configuración
│   ├── prize-selection/      # Selección de premio a sortear
│   ├── lottery/              # Animación de sorteo
│   ├── winners/              # Lista de ganadores
│   ├── layout.tsx            # Layout principal
│   └── globals.css           # Estilos globales
├── components/
│   ├── FullscreenButton.tsx  # Botón de pantalla completa
│   ├── ConfirmModal.tsx      # Modal de confirmación de reset
│   └── PrizeForm.tsx         # Formulario dinámico de premios
├── store/
│   └── lotteryStore.ts       # Estado global con Zustand
├── types/
│   └── index.ts              # Interfaces TypeScript
├── hooks/
│   └── useKeyboardShortcut.ts # Hook para atajos de teclado
└── utils/
    ├── csvParser.ts          # Procesamiento de archivos CSV
    ├── imageConverter.ts     # Conversión de imágenes a base64
    └── pdfExporter.ts        # Exportación de ganadores a PDF
```

## Formato CSV Requerido

El archivo CSV debe tener exactamente 2 columnas con cabecera:

| Nombre Completo       | Cargo                          |
| :-------------------- | :----------------------------- |
| Juan Pérez García     | Gerente de Operaciones         |
| María López Rodríguez | Analista de Recursos Humanos   |
| Carlos Mendoza Torres | Supervisor de Planta           |

## Instalación

```bash
npm install
```

## Uso

### Flujo del Sistema

1. **Página de Configuración** (`/`)
   - Cargar archivo CSV con participantes
   - Agregar tipos de premios con nombre, cantidad e imagen
   - Clic en "Iniciar Sorteo"

2. **Página de Selección de Premio** (`/prize-selection`)
   - Seleccionar el tipo de premio a sortear
   - Solo muestra premios con cantidad disponible

3. **Página de Sorteo** (`/lottery`)
   - Clic para iniciar animación de 15 segundos
   - Muestra ganador al finalizar
   - F8: Re-sortear si el ganador no está presente
   - Clic en "Continuar" para siguiente premio

4. **Página de Ganadores** (`/winners`)
   - Lista de todos los ganadores agrupados por tipo de premio
   - Exportar a PDF
   - Reiniciar sorteo

### Atajos de Teclado

- **F8**: Re-sortear (solo en página de sorteo, cuando hay ganador)
- **F9**: Reiniciar sorteo (disponible en todas las páginas, requiere confirmación)

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Producción

```bash
# Build
npm run build

# Preview local
npm run preview

# Deploy a Cloudflare Workers
npm run build && npm run deploy
```

## Notas Técnicas

- **localStorage**: Las imágenes se guardan en base64, considerar límite de ~5-10MB según navegador
- **Fallback de almacenamiento**: Si localStorage falla, usa sessionStorage automáticamente
- **Recuperación de estado**: Al recargar la página, el sistema retoma donde quedó
- **Validación CSV**: Requiere exactamente 2 columnas con cualquier nombre de cabecera
- **Imágenes soportadas**: JPG, JPEG y PNG sin restricción de tamaño

