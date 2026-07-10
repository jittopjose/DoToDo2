import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { BarcodeDetector } from 'barcode-detector/pure';
import './ScannerOverlay.css';

interface ScannerOverlayProps {
    isOpen: boolean;
    onScanResult: (barcode: string | null) => void;
    onDismiss: () => void;
}

const DETECT_INTERVAL_MS = 200;
const SCAN_WIDTH = 640;
const SCAN_HEIGHT = 480;

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isOpen, onScanResult, onDismiss }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectorRef = useRef<BarcodeDetector | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const onScanResultRef = useRef(onScanResult);
    const onDismissRef = useRef(onDismiss);
    const [error, setError] = useState<string | null>(null);

    onScanResultRef.current = onScanResult;
    onDismissRef.current = onDismiss;

    const stopCamera = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    }, []);

    const detectFrame = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const detector = detectorRef.current;
        if (!video || !canvas || !detector || video.readyState < 2) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = SCAN_WIDTH;
        canvas.height = SCAN_HEIGHT;
        ctx.drawImage(video, 0, 0, SCAN_WIDTH, SCAN_HEIGHT);

        let imageData: ImageData;
        try {
            imageData = ctx.getImageData(0, 0, SCAN_WIDTH, SCAN_HEIGHT);
        } catch {
            return;
        }

        try {
            const barcodes = await detector.detect(imageData);
            if (barcodes.length > 0) {
                const rawValue = barcodes[0].rawValue;
                if (rawValue) {
                    stopCamera();
                    onScanResultRef.current(rawValue);
                }
            }
        } catch {
            /* frame skipped */
        }
    }, [stopCamera]);

    const startCamera = useCallback(async () => {
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            intervalRef.current = setInterval(detectFrame, DETECT_INTERVAL_MS);
        } catch (e) {
            setError('Camera access denied or not available.');
            console.error('Camera error:', e);
        }
    }, [detectFrame]);

    useEffect(() => {
        if (isOpen) {
            detectorRef.current = new BarcodeDetector();
            startCamera();
        }
        return () => {
            stopCamera();
            detectorRef.current = null;
        };
    }, [isOpen, startCamera, stopCamera]);

    const handleClose = useCallback(() => {
        stopCamera();
        onDismissRef.current();
    }, [stopCamera]);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="scanner-modal">
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Scan Barcode</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleClose}>
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="scanner-content">
                {error ? (
                    <div className="scanner-error">
                        <p>{error}</p>
                        <IonButton onClick={startCamera}>Retry</IonButton>
                    </div>
                ) : (
                    <div className="scanner-viewport">
                        <video ref={videoRef} className="scanner-video" playsInline muted />
                        <div className="scanner-viewfinder">
                            <div className="scanner-viewfinder-corner tl" />
                            <div className="scanner-viewfinder-corner tr" />
                            <div className="scanner-viewfinder-corner bl" />
                            <div className="scanner-viewfinder-corner br" />
                        </div>
                        <canvas ref={canvasRef} className="scanner-canvas" />
                    </div>
                )}
            </IonContent>
        </IonModal>
    );
};

export default ScannerOverlay;
