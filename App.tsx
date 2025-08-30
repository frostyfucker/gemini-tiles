import React, { useState, useRef, useCallback } from 'react';
import { useMediaStreams } from './hooks/useMediaStreams';
import { analyzeContent } from './services/geminiService';
// FIX: Import the AFrameEntity type, as it is defined in a module.
// FIX: Use a regular import to ensure global A-Frame types are loaded.
import { AFrameEntity } from './types';
import type { Part } from "@google/genai";

import Controls from './components/Controls';
import MediaStreamTile from './components/MediaStreamTile';
import ResponseTile from './components/ResponseTile';
import AFrameTile from './components/AFrameTile';
import JsonTile from './components/JsonTile';
import PuterTile from './components/PuterTile';

// Helper to convert array to space-separated string for A-Frame
const toAFrameString = (arr: number[] | string | undefined): string | undefined => {
    if (Array.isArray(arr)) {
        return arr.join(' ');
    }
    return arr; // It's already a string or undefined
};

// Helper to parse a string or array into a vector of numbers
const parseVector = (vec: number[] | string | undefined): [number, number, number] => {
    if (!vec) return [0, 0, 0];
    if (Array.isArray(vec)) return [vec[0] || 0, vec[1] || 0, vec[2] || 0];
    const parts = vec.split(' ').map(Number);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
};

const App: React.FC = () => {
    const {
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
    } = useMediaStreams();

    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [geminiResponse, setGeminiResponse] = useState<string>('');
    const [aFrameEntities, setAFrameEntities] = useState<AFrameEntity[]>([]);
    const [rawJsonEntities, setRawJsonEntities] = useState<any[]>([]);
    const [selectedInputs, setSelectedInputs] = useState<string[]>([]);

    const frontCameraTileRef = useRef<{ captureFrame: () => string | null }>(null);
    const rearCameraTileRef = useRef<{ captureFrame: () => string | null }>(null);
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
                setRawJsonEntities(parsed);

                // Flatten compound objects into a single list of renderable primitives
                const flattenedEntities: AFrameEntity[] = [];
                parsed.forEach((item: any) => {
                    // It's a compound object with parts
                    if (item.parts && Array.isArray(item.parts)) {
                        const parentPos = parseVector(item.position);
                        item.parts.forEach((part: any, index: number) => {
                            const partPos = parseVector(part.position);
                            const worldPos: [number, number, number] = [
                                parentPos[0] + partPos[0],
                                parentPos[1] + partPos[1],
                                parentPos[2] + partPos[2],
                            ];

                            flattenedEntities.push({
                                id: `${item.id}_${part.id || index}`,
                                geometry: part.geometry,
                                color: part.color,
                                position: worldPos.join(' '),
                                scale: toAFrameString(part.scale),
                                rotation: toAFrameString(part.rotation),
                            });
                        });
                    } 
                    // It's a simple primitive
                    else if (item.id && item.geometry && item.color && item.position) {
                        flattenedEntities.push({
                            id: item.id,
                            geometry: item.geometry,
                            color: item.color,
                            position: toAFrameString(item.position) || '0 0 0',
                            scale: toAFrameString(item.scale),
                            rotation: toAFrameString(item.rotation),
                        });
                    }
                });


                if (flattenedEntities.length > 0) {
                    setAFrameEntities(flattenedEntities);
                }
            }
        } catch (e) {
            console.error("Failed to parse A-Frame JSON from response:", e);
            // Don't set an error message here, just log it. The raw text is still useful.
        }
    };

    const handleAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setGeminiResponse('');

        const frontCameraFrame = frontCameraTileRef.current?.captureFrame();
        const rearCameraFrame = rearCameraTileRef.current?.captureFrame();
        const screenFrame = screenTileRef.current?.captureFrame();

        const allParts: Part[] = [{ text: prompt }];
        let hasImages = false;

        const addImagePart = (frame: string | null | undefined, sourceName: string) => {
            if (!frame) return;
            const [header, data] = frame.split(',');
            if (!header || !data) return;
            const mimeTypeMatch = header.match(/data:(image\/\w+);base64/);
            if (!mimeTypeMatch || !mimeTypeMatch[1]) return;
            
            allParts.push({ text: `Image from ${sourceName}:` });
            allParts.push({
                inlineData: {
                    mimeType: mimeTypeMatch[1],
                    data: data,
                },
            });
            hasImages = true;
        };

        if (selectedInputs.length > 0) {
            if (selectedInputs.includes('Front Camera Feed')) addImagePart(frontCameraFrame, 'Front Camera');
            if (selectedInputs.includes('Rear Camera Feed')) addImagePart(rearCameraFrame, 'Rear Camera');
            if (selectedInputs.includes('Screen Share')) addImagePart(screenFrame, 'Screen Share');
        } else {
            addImagePart(frontCameraFrame, 'Front Camera');
            addImagePart(rearCameraFrame, 'Rear Camera');
            addImagePart(screenFrame, 'Screen Share');
        }
        
        if (prompt.trim().length === 0 && !hasImages) {
            setError("Please provide a prompt, and/or enable and select an input stream.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await analyzeContent(allParts);
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
                    LensCraft AI 📸✨
                </h1>
                <p className="text-slate-400">Real-time 3D Scene Reconstruction</p>
            </header>

            <main className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1 */}
                <MediaStreamTile 
                    ref={frontCameraTileRef} 
                    stream={frontCameraStream} 
                    title="Front Camera Feed"
                    isSelected={selectedInputs.includes('Front Camera Feed')}
                    onClick={() => toggleInputSelection('Front Camera Feed')}
                />
                <AFrameTile entities={aFrameEntities} />

                {/* Row 2 */}
                <MediaStreamTile 
                    ref={rearCameraTileRef} 
                    stream={rearCameraStream} 
                    title="Rear Camera Feed"
                    isSelected={selectedInputs.includes('Rear Camera Feed')}
                    onClick={() => toggleInputSelection('Rear Camera Feed')}
                />
                <JsonTile entities={rawJsonEntities} />

                {/* Row 3 */}
                <MediaStreamTile 
                    ref={screenTileRef} 
                    stream={screenStream} 
                    title="Screen Share"
                    isSelected={selectedInputs.includes('Screen Share')}
                    onClick={() => toggleInputSelection('Screen Share')}
                />
                <PuterTile />

                {/* Row 4 */}
                <ResponseTile response={geminiResponse} isLoading={isLoading} error={error} className="md:col-span-2" />
            </main>

            <footer className="flex-shrink-0 mt-4">
                <Controls
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                    isFrontCameraOn={!!frontCameraStream}
                    isRearCameraOn={!!rearCameraStream}
                    isScreenOn={!!screenStream}
                    hasMultipleCameras={hasMultipleCameras}
                    onStartFrontCamera={startFrontCamera}
                    onStopFrontCamera={stopFrontCamera}
                    onStartRearCamera={startRearCamera}
                    onStopRearCamera={stopRearCamera}
                    onStartScreenShare={startScreenShare}
                    onStopScreenShare={stopScreenShare}
                />
            </footer>
        </div>
    );
};

export default App;