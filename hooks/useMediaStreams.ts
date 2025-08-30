import { useState, useCallback, useRef, useEffect } from 'react';

export const useMediaStreams = () => {
    const [frontCameraStream, setFrontCameraStream] = useState<MediaStream | null>(null);
    const [rearCameraStream, setRearCameraStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

    const frontCameraStreamRef = useRef<MediaStream | null>(null);
    const rearCameraStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const checkForMultipleCameras = async () => {
            try {
                if (!navigator.mediaDevices?.enumerateDevices) {
                    console.log("enumerateDevices() not supported.");
                    return;
                }
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setHasMultipleCameras(videoDevices.length > 1);
            } catch (err) {
                console.error("Could not enumerate devices:", err);
            }
        };
        
        checkForMultipleCameras();
        navigator.mediaDevices.addEventListener('devicechange', checkForMultipleCameras);
        
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', checkForMultipleCameras);
        };
    }, []);

    const stopStream = (stream: MediaStream | null) => {
        stream?.getTracks().forEach(track => track.stop());
    };

    const startFrontCamera = useCallback(async () => {
        try {
            stopStream(frontCameraStreamRef.current);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            frontCameraStreamRef.current = stream;
            setFrontCameraStream(stream);
        } catch (err) {
            console.error("Error accessing front camera:", err);
            alert("Could not access front camera. Please check permissions.");
        }
    }, []);

    const stopFrontCamera = useCallback(() => {
        stopStream(frontCameraStreamRef.current);
        frontCameraStreamRef.current = null;
        setFrontCameraStream(null);
    }, []);

    const startRearCamera = useCallback(async () => {
        try {
            stopStream(rearCameraStreamRef.current);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: 'environment' } }, audio: false });
            rearCameraStreamRef.current = stream;
            setRearCameraStream(stream);
        } catch (err) {
            console.error("Error accessing rear camera:", err);
            alert("Could not access rear camera. Please check permissions or ensure one is available.");
        }
    }, []);

    const stopRearCamera = useCallback(() => {
        stopStream(rearCameraStreamRef.current);
        rearCameraStreamRef.current = null;
        setRearCameraStream(null);
    }, []);

    const startScreenShare = useCallback(async () => {
        try {
            stopStream(screenStreamRef.current);
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            screenStreamRef.current = stream;
            setScreenStream(stream);

            stream.getVideoTracks()[0].addEventListener('ended', () => {
                 stopScreenShare();
            });
        } catch (err) {
            console.error("Error accessing screen share:", err);
        }
    }, []);

    const stopScreenShare = useCallback(() => {
        stopStream(screenStreamRef.current);
        screenStreamRef.current = null;
        setScreenStream(null);
    }, []);

    return {
        frontCameraStream,
        rearCameraStream,
        screenStream,
        hasMultipleCameras,
        startFrontCamera,
        stopFrontCamera,
        startRearCamera,
        stopRearCamera,
        startScreenShare,
        stopScreenShare,
    };
};
