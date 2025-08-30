// This interface defines the shape of a single 3D object entity
// that can be rendered in the A-Frame scene.
export interface AFrameEntity {
  id: string;
  geometry: string;
  color: string;
  position: string;
  scale?: string;
  rotation?: string;
}

// This global declaration block extends TypeScript's JSX support to recognize
// A-Frame's custom HTML elements (e.g., <a-scene>, <a-entity>). This prevents
// "Property 'a-scene' does not exist on type 'JSX.IntrinsicElements'" errors.
declare global {
  // Declares the global AFRAME object provided by the A-Frame library script.
  // This prevents "Cannot find name 'AFRAME'" errors in components that interact with it.
  const AFRAME: any;

  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-entity': any;
      'a-text': any;
      'a-plane': any;
      'a-sky': any;
      'a-cursor': any;
    }
  }
}
