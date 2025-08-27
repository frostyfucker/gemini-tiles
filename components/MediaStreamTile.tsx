import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Tile from './Tile';

interface MediaStreamTileProps {
  stream: MediaStream | null;
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
}

const MediaStreamTile = forwardRef((props: MediaStreamTileProps, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, title, isSelected, onClick } = props;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useImperativeHandle(ref, () => ({
    captureFrame: (): string | null => {
      const video = videoRef.current;
      if (!video || !stream || video.videoHeight === 0) return null;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
      return null;
    }
  }));

  return (
    <Tile title={title} isSelected={isSelected} onClick={onClick}>
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-slate-500 text-center p-4">
            <p>{title === 'Camera Feed' ? 'Camera Off' : 'Not Sharing Screen'}</p>
            <p className="text-xs mt-2 text-slate-400">Click tile to select for analysis</p>
          </div>
        )}
      </div>
    </Tile>
  );
});

export default MediaStreamTile;