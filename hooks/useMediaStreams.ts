
import { useState, useCallback, useRef } from 'react';

export const useMediaStreams = () => {
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

    const cameraStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    const stopStream = (stream: MediaStream | null) => {
        stream?.getTracks().forEach(track => track.stop());
    };

    const startCamera = useCallback(async () => {
        try {
            stopStream(cameraStreamRef.current);
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            cameraStreamRef.current = stream;
            setCameraStream(stream);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
        }
    }, []);

    const stopCamera = useCallback(() => {
        stopStream(cameraStreamRef.current);
        cameraStreamRef.current = null;
        setCameraStream(null);
    }, []);

    const startScreenShare = useCallback(async () => {
        try {
            stopStream(screenStreamRef.current);
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            screenStreamRef.current = stream;
            setScreenStream(stream);

            // Add a listener to stop our stream state when the browser's native "Stop sharing" button is clicked
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                 stopScreenShare();
            });
        } catch (err) {
            console.error("Error accessing screen share:", err);
            // Don't alert for screen share cancellation
        }
    }, []);

    const stopScreenShare = useCallback(() => {
        stopStream(screenStreamRef.current);
        screenStreamRef.current = null;
        setScreenStream(null);
    }, []);

    return {
        cameraStream,
        screenStream,
        startCamera,
        stopCamera,
        startScreenShare,
        stopScreenShare,
    };
};
