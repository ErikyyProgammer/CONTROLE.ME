import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setCameraError(null);

    const config = {
      fps: 10,
      qrbox: { width: 280, height: 180 },
      aspectRatio: 1.333,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.QR_CODE,
      ],
    };

    const scanner = new Html5QrcodeScanner('reader-container', config, /* verbose= */ false);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        soundEffects.playBeep();
        onScanSuccess(decodedText);
        // Clear scanner after successful match
        try {
          scanner.clear().catch(console.error);
        } catch (e) {
          console.error(e);
        }
      },
      (errorMessage) => {
        // Ignore noise errors during scanning
      }
    );

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch {
          // cleanup fallback
        }
      }
    };
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-gray-100">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Leitor de Código de Barras</h3>
              <p className="text-xs text-slate-300">Aponte a câmera para o código do produto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center bg-slate-50">
          {cameraError ? (
            <div className="flex flex-col items-center text-center p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 my-4 w-full">
              <AlertCircle className="w-10 h-10 mb-2 text-red-500" />
              <p className="font-medium text-sm mb-1">Não foi possível acessar a câmera</p>
              <p className="text-xs text-red-600 mb-4">{cameraError}</p>
              <button
                onClick={() => setCameraError(null)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
              >
                <RefreshCw className="w-4 h-4" /> Tentar Novamente
              </button>
            </div>
          ) : (
            <div className="w-full relative">
              <div id="reader-container" className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-black"></div>
              <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                <span>💡</span> Dica: Mantenha o código de barras centralizado e bem iluminado.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
