import React from 'react';
import Tile from './Tile';

interface JsonTileProps {
  entities: any[];
}

const JsonTile: React.FC<JsonTileProps> = ({ entities }) => {
  const jsonString = JSON.stringify(entities, null, 2);

  const handleExport = () => {
    if (!entities || entities.length === 0) return;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aframe-scene.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Tile title="A-Frame Scene JSON">
      <div className="absolute inset-0 flex flex-col">
        <pre className="flex-grow p-4 overflow-y-auto whitespace-pre-wrap break-words text-sm text-slate-300 font-mono">
          {entities.length > 0 ? jsonString : <span className="text-slate-500">JSON data for the 3D scene will appear here...</span>}
        </pre>
        <div className="p-2 border-t border-cyan-500/30 bg-slate-800/50">
          <button
            onClick={handleExport}
            disabled={entities.length === 0}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-md transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Export JSON
          </button>
        </div>
      </div>
    </Tile>
  );
};

export default JsonTile;