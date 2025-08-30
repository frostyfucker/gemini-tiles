import React, { useEffect, useRef } from 'react';
import Tile from './Tile';

// This global declaration block extends TypeScript's support to recognize
// the `puter` object provided by the puter.js script.
declare global {
  const puter: any;
}

const PuterTile: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Attempt to initialize Puter. We use a ref to prevent re-initialization on re-renders.
    const initialize = () => {
      if (typeof puter !== 'undefined' && containerRef.current && !isInitialized.current) {
        puter.init({
          root: containerRef.current,
        });
        isInitialized.current = true;
      }
    };
    
    // The external script might load after the component mounts.
    // We can poll for it, or just use a timeout as a simple solution.
    const timeoutId = setTimeout(initialize, 200);

    return () => {
      clearTimeout(timeoutId);
      // No official cleanup method is documented. Clearing the container is the safest option
      // to remove the UI and prevent some memory leaks from DOM nodes.
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      isInitialized.current = false;
    };
  }, []);

  return (
    <Tile title="Puter 💻" className="p-0">
      <div ref={containerRef} className="w-full h-full bg-black" />
    </Tile>
  );
};

export default PuterTile;
