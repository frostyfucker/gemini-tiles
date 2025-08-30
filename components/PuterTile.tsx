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
    // The Puter.js script is loaded externally and may not be ready when this component mounts.
    // We'll use an interval to check for the `puter` object on the window.
    const intervalId = setInterval(() => {
      // Once `puter` is available, initialize it and stop checking.
      if (typeof puter !== 'undefined' && containerRef.current && !isInitialized.current) {
        puter.init({
          root: containerRef.current,
        });
        isInitialized.current = true;
        clearInterval(intervalId); // Stop the interval
      }
    }, 100); // Check every 100ms

    // Cleanup function to clear the interval and the Puter instance if the component unmounts.
    return () => {
      clearInterval(intervalId);
      if (containerRef.current) {
        // Puter doesn't provide a dedicated cleanup/destroy method.
        // The safest way to remove it is to clear the container's inner HTML.
        containerRef.current.innerHTML = '';
      }
      isInitialized.current = false;
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  return (
    <Tile title="Puter 💻">
      <div ref={containerRef} className="w-full h-full bg-black" />
    </Tile>
  );
};

export default PuterTile;