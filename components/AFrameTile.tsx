import React, { useEffect } from 'react';
import Tile from './Tile';
// FIX: Import the AFrameEntity type, as it is defined in a module.
// FIX: Use a regular import to ensure global A-Frame types are loaded, which fixes errors with custom JSX elements.
import { AFrameEntity } from '../types';

interface AFrameTileProps {
  entities: AFrameEntity[];
}

const AFrameTile: React.FC<AFrameTileProps> = ({ entities }) => {
  useEffect(() => {
    // Since A-Frame is not a React library, we register custom components
    // in an effect hook to ensure the A-Frame script has loaded and is ready.
    if (AFRAME.components['grab-manager']) return; // Prevent re-registering

    AFRAME.registerComponent('grab-manager', {
      init: function () {
        this.grabbedEl = null;
        this.cursor = this.el.querySelector('a-cursor');
        this.ground = document.querySelector('#ground');

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onRotate = this.onRotate.bind(this);

        this.el.sceneEl.addEventListener('mousedown', this.onMouseDown);
      },

      onMouseDown: function (evt) {
        // Only trigger on left click
        if (evt.button !== 0) return;

        if (this.grabbedEl) {
          // If we are holding an object, place it.
          this.place();
        } else {
          // If not holding an object, try to grab one.
          const intersectedEls = this.cursor.components.raycaster.intersectedEls;
          // Find the first intersected element that is actually a grabbable object
          const intersectedEl = intersectedEls.find(el => el.classList.contains('grabbable'));
          
          if (intersectedEl) {
            this.grab(intersectedEl);
          }
        }
      },

      grab: function (el) {
        this.grabbedEl = el;
        
        // Make raycaster ignore the grabbed object so we can detect the ground
        this.cursor.setAttribute('raycaster', 'objects', `.grabbable:not(#${el.id}), #ground`);
        
        // Attach to camera using A-Frame's scene graph attach method
        this.el.object3D.attach(this.grabbedEl.object3D);
        // Position it in front of the camera
        this.grabbedEl.setAttribute('position', { x: 0, y: -0.5, z: -1.5 });
        
        window.addEventListener('wheel', this.onRotate);
      },

      place: function () {
        if (!this.grabbedEl) return;
        
        const intersection = this.cursor.components.raycaster.getIntersection(this.ground);
        const sceneEl = this.el.sceneEl;

        // Detach from camera and re-attach to the scene
        sceneEl.object3D.attach(this.grabbedEl.object3D);

        if (intersection) {
          const pos = intersection.point;
          // Account for object's scale to place it on top of the ground, not in it
          const objectHeight = this.grabbedEl.getAttribute('scale').y / 2;
          this.grabbedEl.setAttribute('position', { x: pos.x, y: pos.y + objectHeight, z: pos.z });
        }
        // If no intersection, it's already detached and will maintain its last transform in world space.

        // Reset raycaster to target all grabbable objects again
        this.cursor.setAttribute('raycaster', 'objects', '.grabbable, #ground');

        window.removeEventListener('wheel', this.onRotate);
        this.grabbedEl = null;
      },

      onRotate: function (evt) {
        if (!this.grabbedEl) return;
        const rotation = this.grabbedEl.getAttribute('rotation');
        const rotationSpeed = 10;
        // scroll up is negative deltaY, scroll down is positive
        rotation.y += evt.deltaY < 0 ? rotationSpeed : -rotationSpeed;
        this.grabbedEl.setAttribute('rotation', rotation);
      },

      remove: function () {
        this.el.sceneEl.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('wheel', this.onRotate);
        // If the component is removed while holding an object, place it safely.
        if (this.grabbedEl) {
            this.place();
        }
      }
    });
  }, []); // Run only once on mount

  return (
    <Tile title="3D Visualization" className="p-0">
      <div className="w-full h-full">
        <a-scene embedded className="w-full h-full">
          <a-assets>
            <img id="grid" src="https://raw.githubusercontent.com/aframevr/aframe/master/examples/showcase/anime-UI/assets/grid.png" crossOrigin="anonymous"/>
          </a-assets>

          {entities && entities.length > 0 ? (
            entities.map((entity) => (
              <a-entity
                key={entity.id}
                id={entity.id}
                className="grabbable"
                geometry={`primitive: ${entity.geometry}`}
                material={`color: ${entity.color}; shader: standard; roughness: 0.3; metalness: 0.2;`}
                position={entity.position}
                scale={entity.scale || '1 1 1'}
                rotation={entity.rotation || '0 0 0'}
              >
                <a-entity look-at="#player-camera">
                   <a-text
                      value={entity.id}
                      align="center"
                      color="#FFF"
                      position="0 0.8 0"
                      scale="1.5 1.5 1.5"
                      wrap-count="20"
                    ></a-text>
                </a-entity>
              </a-entity>
            ))
          ) : (
            <a-text 
              value={"3D objects appear here.\n\nWASD: Move\nMouse Drag: Look\nClick Object: Grab/Place\nMouse Wheel: Rotate Grabbed Object"}
              align="center"
              color="#CYAN"
              position="0 1.5 -2.5"
              width="4"
            ></a-text>
          )}

          <a-plane id="ground" material="src: #grid; repeat: 10 10; transparent: true; opacity: 0.5" rotation="-90 0 0" height="20" width="20"></a-plane>
          <a-sky color="#111827"></a-sky>
          <a-entity light="type: ambient; color: #888;"></a-entity>
          <a-entity light="type: directional; color: #FFF; intensity: 0.5" position="-1 1 2"></a-entity>
          
          <a-entity id="player-camera" camera look-controls wasd-controls="true" position="0 1.6 4" grab-manager>
            <a-cursor raycaster="objects: .grabbable, #ground; far: 20;"></a-cursor>
          </a-entity>
        </a-scene>
      </div>
    </Tile>
  );
};

export default AFrameTile;