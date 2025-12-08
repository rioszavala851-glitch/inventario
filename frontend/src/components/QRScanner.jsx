import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

const QRScanner = ({ onScan, onClose }) => {
    const scannerRef = useRef(null);
    const [error, setError] = useState('');
    const scannerInstanceRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const initScanner = async () => {
            // Wait for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!mounted) return;

            try {
                const scanner = new Html5QrcodeScanner(
                    'qr-reader',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true,
                        showZoomSliderIfSupported: true,
                    },
                    false
                );

                scannerInstanceRef.current = scanner;

                const onScanSuccess = (decodedText) => {
                    console.log('QR Code detected:', decodedText);
                    if (scanner && mounted) {
                        scanner.clear().catch(err => console.error('Clear error:', err));
                        onScan(decodedText);
                    }
                };

                const onScanError = (errorMessage) => {
                    // Ignore frequent scan errors
                    if (!errorMessage.includes('NotFoundException')) {
                        console.warn('QR Scan error:', errorMessage);
                    }
                };

                scanner.render(onScanSuccess, onScanError);
            } catch (err) {
                console.error('Scanner init error:', err);
                setError('Error al inicializar la cámara. Por favor, verifica los permisos.');
            }
        };

        initScanner();

        return () => {
            mounted = false;
            if (scannerInstanceRef.current) {
                scannerInstanceRef.current.clear().catch(err => console.error('Cleanup error:', err));
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                            <Camera className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Escanear Código QR</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Apunta la cámara al código QR</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Scanner */}
                <div className="p-6">
                    <div id="qr-reader" ref={scannerRef} className="rounded-2xl overflow-hidden"></div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            💡 <strong>Consejo:</strong> Asegúrate de que el código QR esté bien iluminado y enfocado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
