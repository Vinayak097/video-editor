'use client';

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { RootState } from '@/app/redux/store';
import {
  AudioTrack,
  addAudioTrack,
  updateAudioTrack,
  removeAudioTrack,
  toggleMuteAudioTrack,
  setAudioTrackVolume,
  setSelectedAudioTrack
} from '@/app/redux/slices/audioSlice';
import { Button } from '../ui/button';
import { Slider } from '@/components/ui/slider';
import { generateId } from '@/lib/utils/id';

export function AudioManager() {
  const dispatch = useDispatch();
  const { tracks, selectedTrackId } = useSelector((state: RootState) => state.audio);
  const { uploadedVideo } = useSelector((state: RootState) => state.video);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Check if file is an audio
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file');
      return;
    }
    
    const trackId = generateId();
    dispatch(addAudioTrack({
      id: trackId,
      name: file.name,
      startTime: 0,
      endTime: uploadedVideo.duration || 100,
      volume: 1,
      isMuted: false,
      file,
      url: URL.createObjectURL(file),
      isOriginal: false
    }));
    
    dispatch(setSelectedAudioTrack(trackId));
  }, [dispatch, uploadedVideo.duration]);
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'audio/*': []
    },
    maxFiles: 1
  });

  const handleTrackSelect = (trackId: string) => {
    dispatch(setSelectedAudioTrack(trackId));
  };

  const handleTrackDelete = (trackId: string) => {
    dispatch(removeAudioTrack(trackId));
  };

  const handleMuteToggle = (trackId: string) => {
    dispatch(toggleMuteAudioTrack(trackId));
  };

  const handleVolumeChange = (trackId: string, volume: number[]) => {
    dispatch(setAudioTrackVolume({ id: trackId, volume: volume[0] }));
  };

  const handleStartTimeChange = (trackId: string, startTime: number[]) => {
    dispatch(updateAudioTrack({
      id: trackId,
      updates: { startTime: startTime[0] }
    }));
  };

  const handleEndTimeChange = (trackId: string, endTime: number[]) => {
    dispatch(updateAudioTrack({
      id: trackId,
      updates: { endTime: endTime[0] }
    }));
  };

  return (
    <div className="w-full bg-neutral-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Audio Tracks</h3>
        
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button variant="outline" size="sm">
            Add Audio Track
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {tracks.map((track) => (
          <AudioTrackComponent
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            videoDuration={uploadedVideo.duration}
            onSelect={() => handleTrackSelect(track.id)}
            onDelete={() => handleTrackDelete(track.id)}
            onMuteToggle={() => handleMuteToggle(track.id)}
            onVolumeChange={(volume) => handleVolumeChange(track.id, volume)}
            onStartTimeChange={(time) => handleStartTimeChange(track.id, time)}
            onEndTimeChange={(time) => handleEndTimeChange(track.id, time)}
          />
        ))}
      </div>
      
      {tracks.length === 0 && !uploadedVideo.url && (
        <div className="text-center py-8 text-neutral-500">
          Upload a video to manage audio
        </div>
      )}
    </div>
  );
}

interface AudioTrackComponentProps {
  track: AudioTrack;
  isSelected: boolean;
  videoDuration: number;
  onSelect: () => void;
  onDelete: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number[]) => void;
  onStartTimeChange: (time: number[]) => void;
  onEndTimeChange: (time: number[]) => void;
}

function AudioTrackComponent({
  track,
  isSelected,
  videoDuration,
  onSelect,
  onDelete,
  onMuteToggle,
  onVolumeChange,
  onStartTimeChange,
  onEndTimeChange
}: AudioTrackComponentProps) {
  return (
    <div
      className={`relative p-3 rounded-md ${
        isSelected ? 'bg-primary/10 border border-primary' : 'bg-white border border-neutral-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMuteToggle();
            }}
          >
            {track.isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                <path d="m23 9-6 6" />
                <path d="m17 9 6 6" />
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
                className="h-4 w-4"
              >
                <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </Button>
          <span className="text-sm font-medium truncate max-w-[200px]">
            {track.name}
          </span>
        </div>
        
        {!track.isOriginal && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs w-14">Volume:</span>
        <Slider
          value={[track.volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
          className="flex-1"
          onClick={(e) => e.stopPropagation()}
          disabled={track.isMuted}
        />
        <span className="text-xs w-8">{Math.round(track.volume * 100)}%</span>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs w-14">Start:</span>
          <Slider
            value={[track.startTime]}
            min={0}
            max={track.endTime - 0.1}
            step={0.1}
            onValueChange={onStartTimeChange}
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs w-12">{track.startTime.toFixed(1)}s</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs w-14">End:</span>
          <Slider
            value={[track.endTime]}
            min={track.startTime + 0.1}
            max={videoDuration || 100}
            step={0.1}
            onValueChange={onEndTimeChange}
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs w-12">{track.endTime.toFixed(1)}s</span>
        </div>
      </div>
      
      {/* Mock audio waveform */}
      <div className="mt-3 h-8 bg-neutral-200 rounded overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 100 30">
            {Array.from({ length: 50 }).map((_, i) => {
              const height = Math.random() * 20 + 5;
              return (
                <rect
                  key={i}
                  x={i * 2}
                  y={(30 - height) / 2}
                  width="1"
                  height={height}
                  fill={track.isMuted ? "#ccc" : "#6366f1"}
                  opacity={track.isMuted ? 0.5 : 0.8}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
