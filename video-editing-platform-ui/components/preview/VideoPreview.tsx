'use client';

import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/redux/store';
import {
  setIsPlaying,
  setCurrentTime,
  setDuration
} from '@/app/redux/slices/videoSlice';
import { Button } from '../ui/button';
import { Subtitle } from '@/app/redux/slices/subtitleSlice';
import { ImageOverlay } from '@/app/redux/slices/overlaySlice';
import { TextOverlay } from '@/app/redux/slices/overlaySlice';
import ReactPlayer from 'react-player';
export function VideoPreview() {
  const dispatch = useDispatch();
  const playerRef = useRef<ReactPlayer>(null);
  const { uploadedVideo, isPlaying, currentTime } = useSelector((state: RootState) => state.video);
  const subtitles = useSelector((state: RootState) => state.subtitle.subtitles);
  const imageOverlays = useSelector((state: RootState) => state.overlay.images);
  const textOverlays = useSelector((state: RootState) => state.overlay.texts);

  // Find active subtitles and overlays based on current time
  const activeSubtitles = subtitles.filter(
    (subtitle) => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
  );

  const activeImageOverlays = imageOverlays.filter(
    (overlay) => currentTime >= overlay.startTime && currentTime <= overlay.endTime
  );

  const activeTextOverlays = textOverlays.filter(
    (overlay) => currentTime >= overlay.startTime && currentTime <= overlay.endTime
  );

  const handlePlayPause = () => {
    dispatch(setIsPlaying(!isPlaying));
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    dispatch(setCurrentTime(state.playedSeconds));
  };

  const handleDuration = (duration: number) => {
    dispatch(setDuration(duration));
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {uploadedVideo.url ? (
        <>
          <ReactPlayer
            ref={playerRef}
            url={uploadedVideo.url}
            width="100%"
            height="100%"
            playing={isPlaying}
            onProgress={handleProgress}
            onDuration={handleDuration}
            progressInterval={100}
          />

          {/* Render active subtitles */}
          {activeSubtitles.map((subtitle) => (
            <SubtitleOverlay key={subtitle.id} subtitle={subtitle} />
          ))}

          {/* Render active image overlays */}
          {activeImageOverlays.map((overlay) => (
            <ImageOverlayComponent key={overlay.id} overlay={overlay} />
          ))}

          {/* Render active text overlays */}
          {activeTextOverlays.map((overlay) => (
            <TextOverlayComponent key={overlay.id} overlay={overlay} />
          ))}

          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button
              variant="secondary"
              size="icon"
              onClick={handlePlayPause}
              className="bg-black/50 hover:bg-black/70"
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="4" height="16" x="6" y="4" />
                  <rect width="4" height="16" x="14" y="4" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/70">Upload a video to preview</p>
        </div>
      )}
    </div>
  );
}

// Subtitle overlay component
function SubtitleOverlay({ subtitle }: { subtitle: Subtitle }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${subtitle.position.x}%`,
        bottom: `${subtitle.position.y}%`,
        fontFamily: subtitle.font,
        fontSize: `${subtitle.fontSize}px`,
        color: subtitle.color,
        textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
        maxWidth: '80%',
        textAlign: 'center',
        padding: '0.5rem',
      }}
    >
      {subtitle.text}
    </div>
  );
}

// Image overlay component
function ImageOverlayComponent({ overlay }: { overlay: ImageOverlay }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${overlay.position.x}%`,
        top: `${overlay.position.y}%`,
        width: `${overlay.size.width}px`,
        height: `${overlay.size.height}px`,
        opacity: overlay.opacity,
        border: overlay.border.width > 0 ? `${overlay.border.width}px ${overlay.border.style} ${overlay.border.color}` : 'none',
      }}
    >
      <img
        src={overlay.url}
        alt="Overlay"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

// Text overlay component
function TextOverlayComponent({ overlay }: { overlay: TextOverlay }) {
  return (
    <div
      className="absolute"
      style={{
        left: `${overlay.position.x}%`,
        top: `${overlay.position.y}%`,
        fontFamily: overlay.font,
        fontSize: `${overlay.fontSize}px`,
        color: overlay.color,
        textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
      }}
    >
      {overlay.text}
    </div>
  );
}
