import React from 'react';
import CameraIcon from './icons/CameraIcon';
import ScreenIcon from './icons/ScreenIcon';
import StopIcon from './icons/StopIcon';
import SparklesIcon from './icons/SparklesIcon';

interface ControlsProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onAnalyze: () => void;
    isLoading: boolean;
    isFrontCameraOn: boolean;
    isRearCameraOn: boolean;
    isScreenOn: boolean;
    hasMultipleCameras: boolean;
    onStartFrontCamera: () => void;
    onStopFrontCamera: () => void;
    onStartRearCamera: () => void;
    onStopRearCamera: () => void;
    onStartScreenShare: () => void;
    onStopScreenShare: () => void;
}

const Controls: React.FC<ControlsProps> = ({
    prompt,
    setPrompt,
    onAnalyze,
    isLoading,
    isFrontCameraOn,
    isRearCameraOn,
    isScreenOn,
    hasMultipleCameras,
    onStartFrontCamera,
    onStopFrontCamera,
    onStartRearCamera,
    onStopRearCamera,
    onStartScreenShare,
    onStopScreenShare,
}) => {
    return (
        <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow flex flex-col gap-2">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what you see or what you want to analyze..."
                        className="w-full flex-grow bg-slate-900/70 border border-slate-600 rounded-md p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                        rows={3}
                        disabled={isLoading}
                    />
                     <p className="text-xs text-slate-500">Select an input tile by clicking on it. Ask for a 3D visualization to see objects appear in the 3D panel!</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex gap-2 flex-wrap justify-center">
                        {isFrontCameraOn ? (
                            <button onClick={onStopFrontCamera} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200"><StopIcon/> Front Cam</button>
                        ) : (
                            <button onClick={onStartFrontCamera} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-blue-500/80 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200"><CameraIcon/> Front Cam</button>
                        )}
                        {hasMultipleCameras && (
                            isRearCameraOn ? (
                                <button onClick={onStopRearCamera} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200"><StopIcon/> Rear Cam</button>
                            ) : (
                                <button onClick={onStartRearCamera} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-blue-500/80 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200"><CameraIcon/> Rear Cam</button>
                            )
                        )}
                        {isScreenOn ? (
                             <button onClick={onStopScreenShare} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200"><StopIcon/> Screen</button>
                        ) : (
                             <button onClick={onStartScreenShare} className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-blue-500/80 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-200"><ScreenIcon/> Screen</button>
                        )}
                    </div>
                     <button
                        onClick={onAnalyze}
                        disabled={isLoading}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-md transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8_0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                            </>
                        ) : (
                            <><SparklesIcon/> Analyze</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Controls;