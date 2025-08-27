import React, { useState, useRef, useCallback } from 'react';
import { useMediaStreams } from './hooks/useMediaStreams';
import { analyzeContent } from './services/geminiService';
import { AFrameEntity } from './types';

import Controls from './components/Controls';
import MediaStreamTile from './components/MediaStreamTile';
import ResponseTile from './components/ResponseTile';
import AFrameTile from './components/AFrameTile';

// Helper to convert array to space-separated string for A-Frame
const toAFrameString = (arr: number[] | string | undefined): string | undefined => {
    if (Array.isArray(arr)) {
        return arr.join(' ');
    }
    return arr; // It's already a string or undefined
};

const App: React.FC = () => {
    const {
        cameraStream,
        screenStream,
        startCamera,
        stopCamera,
        startScreenShare,
        stopScreenShare,
    } = useMediaStreams();

    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [geminiResponse, setGeminiResponse] = useState<string>('');
    const [aFrameEntities, setAFrameEntities] = useState<AFrameEntity[]>([]);
    const [selectedInputs, setSelectedInputs] = useState<string[]>([]);

    const cameraTileRef = useRef<{ captureFrame: () => string | null }>(null);
    const screenTileRef = useRef<{ captureFrame: () => string | null }>(null);

    const toggleInputSelection = (inputId: string) => {
        setSelectedInputs(prev =>
            prev.includes(inputId)
                ? prev.filter(id => id !== inputId)
                : [...prev, inputId]
        );
    };

    const parseGeminiResponse = (text: string) => {
        setGeminiResponse(text);
        try {
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                let parsed = JSON.parse(jsonMatch[1]);
                if (!Array.isArray(parsed)) {
                    parsed = [parsed];
                }

                const entities: AFrameEntity[] = parsed.map((item: any) => ({
                    geometry: item.geometry,
                    color: item.color,
                    position: toAFrameString(item.position) || '0 0 0',
                    scale: toAFrameString(item.scale),
                    rotation: toAFrameString(item.rotation),
                })).filter((e: AFrameEntity) => e.geometry && e.color && e.position);

                if (entities.length > 0) {
                    setAFrameEntities(entities);
                }
            }
        } catch (e) {
            console.error("Failed to parse A-Frame JSON from response:", e);
        }
    };

    const handleAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setGeminiResponse('');

        const cameraFrame = cameraTileRef.current?.captureFrame();
        const screenFrame = screenTileRef.current?.captureFrame();

        const images: string[] = [];
        let analysisPrompt = prompt;

        if (selectedInputs.length > 0) {
            analysisPrompt = `The user has focused on the following inputs for analysis: ${selectedInputs.join(', ')}. Please prioritize them.\n\nUser prompt: ${prompt}`;
            if (selectedInputs.includes('Camera Feed') && cameraFrame) {
                images.push(cameraFrame);
            }
            if (selectedInputs.includes('Screen Share') && screenFrame) {
                images.push(screenFrame);
            }
        } else {
            if (cameraFrame) images.push(cameraFrame);
            if (screenFrame) images.push(screenFrame);
        }

        if (prompt.trim().length === 0 && images.length === 0) {
            setError("Please provide a prompt, and/or enable and select an input stream.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await analyzeContent(analysisPrompt, images);
            parseGeminiResponse(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, selectedInputs]);

    return (
        <div className="min-h-screen bg-slate-900/50 text-slate-100 font-sans p-4 flex flex-col">
            <header className="flex-shrink-0 mb-4 text-center">
                <h1 className="text-4xl font-bold text-cyan-300 tracking-wider">
                    GEMINI TILING HUD
                </h1>
                <p className="text-slate-400">Multi-modal AI Analysis Interface</p>
            </header>

            <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
                <MediaStreamTile 
                    ref={cameraTileRef} 
                    stream={cameraStream} 
                    title="Camera Feed"
                    isSelected={selectedInputs.includes('Camera Feed')}
                    onClick={() => toggleInputSelection('Camera Feed')}
                />
                <MediaStreamTile 
                    ref={screenTileRef} 
                    stream={screenStream} 
                    title="Screen Share"
                    isSelected={selectedInputs.includes('Screen Share')}
                    onClick={() => toggleInputSelection('Screen Share')}
                />
                <ResponseTile response={geminiResponse} isLoading={isLoading} error={error} />
                <AFrameTile entities={aFrameEntities} />
            </main>

            <footer className="flex-shrink-0 mt-4">
                <Controls
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                    isCameraOn={!!cameraStream}
                    isScreenOn={!!screenStream}
                    onStartCamera={startCamera}
                    onStopCamera={stopCamera}
                    onStartScreenShare={startScreenShare}
                    onStopScreenShare={stopScreenShare}
                />
            </footer>
        </div>
    );
};

export default App;