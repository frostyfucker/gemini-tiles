

import React from 'react';
import Tile from './Tile';

interface ResponseTileProps {
  response: string;
  isLoading: boolean;
  error: string | null;
  className?: string;
}

const ResponseTile: React.FC<ResponseTileProps> = ({ response, isLoading, error, className }) => {
  return (
    <Tile title="Gemini Analysis" className={className}>
      <div className="absolute inset-0 p-4 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-cyan-400 mx-auto mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-400">Analyzing inputs...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-md">
              <h3 className="font-bold">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        )}
        {!isLoading && !error && (
          <pre className="whitespace-pre-wrap break-words text-slate-300 font-sans">
            {response || <span className="text-slate-500">Awaiting analysis...</span>}
          </pre>
        )}
      </div>
    </Tile>
  );
};

export default ResponseTile;