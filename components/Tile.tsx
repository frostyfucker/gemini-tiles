import React, { ReactNode } from 'react';

interface TileProps {
  children: ReactNode;
  title: string;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const Tile: React.FC<TileProps> = ({ children, title, className = '', isSelected, onClick }) => {
  const selectionClasses = isSelected
    ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-400'
    : 'border border-cyan-500/30';

  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`
        bg-slate-800/50 rounded-lg shadow-lg shadow-cyan-500/10 
        flex flex-col overflow-hidden backdrop-blur-sm transition-all duration-200
        ${selectionClasses} ${cursorClass} ${className}`
      }
      onClick={onClick}
      aria-selected={isSelected}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h2 className="bg-slate-900/70 text-cyan-300 p-2 text-sm font-semibold tracking-wider border-b border-cyan-500/30">
        {title}
      </h2>
      <div className="p-4 flex-grow relative">
        {children}
      </div>
    </div>
  );
};

export default Tile;