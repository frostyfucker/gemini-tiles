
export interface AFrameEntity {
  geometry: string;
  color: string;
  position: string;
  scale?: string;
  rotation?: string;
}

// FIX: Define A-Frame custom elements for TypeScript JSX to resolve type errors.
// By placing this in a central types file, we ensure it's globally available across the project.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-entity': any;
      'a-text': any;
      'a-plane': any;
      'a-sky': any;
    }
  }
}
