import React from 'react';
import Tile from './Tile';
import { AFrameEntity } from '../types';

interface AFrameTileProps {
  entities: AFrameEntity[];
}

const AFrameTile: React.FC<AFrameTileProps> = ({ entities }) => {
  // By using a key on the a-scene, we force React to re-mount it when the entity changes,
  // which is a reliable way to update A-Frame scenes managed by React.
  const sceneKey = JSON.stringify(entities);

  return (
    <Tile title="3D Visualization" className="p-0">
      <div className="w-full h-full">
        <a-scene key={sceneKey} embedded className="w-full h-full">
          <a-assets>
            <img id="grid" src="https://raw.githubusercontent.com/aframevr/aframe/master/examples/showcase/anime-UI/assets/grid.png" crossOrigin="anonymous"/>
          </a-assets>

          {entities && entities.length > 0 ? (
            entities.map((entity, index) => (
              <a-entity
                key={index}
                geometry={`primitive: ${entity.geometry}`}
                material={`color: ${entity.color}; shader: standard; roughness: 0.3; metalness: 0.2;`}
                position={entity.position}
                scale={entity.scale || '1 1 1'}
                rotation={entity.rotation || '0 0 0'}
                animation__rotation="property: rotation; to: 0 360 0; loop: true; dur: 10000; easing: linear; dir: alternate"
              />
            ))
          ) : (
            <a-text 
              value="3D model objects will appear here"
              align="center"
              color="#CYAN"
              position="0 1.5 -2.5"
              width="4"
            ></a-text>
          )}

          <a-plane material="src: #grid; repeat: 10 10; transparent: true; opacity: 0.5" rotation="-90 0 0" height="20" width="20"></a-plane>
          <a-sky color="#111827"></a-sky>
          <a-entity light="type: ambient; color: #888;"></a-entity>
          <a-entity light="type: directional; color: #FFF; intensity: 0.5" position="-1 1 2"></a-entity>
          <a-entity camera look-controls wasd-controls-enabled="false" position="0 1.6 4"></a-entity>
        </a-scene>
      </div>
    </Tile>
  );
};

export default AFrameTile;