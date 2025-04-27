'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/redux/store';
import {
  setUploadedVideo,
  setIsUploading,
  setUploadProgress
} from '@/app/redux/slices/videoSlice';

import { Button } from '../ui/button';
import { generateId } from '@/lib/utils/id';
import { addSegment } from '@/app/redux/slices/timelineSlice';
import { addAudioTrack } from '@/app/redux/slices/audioSlice';
import { Progress } from '../ui/progress';

export function VideoUpload() {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (!file) return;

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    setError(null);

    // Simulate upload process
    dispatch(setIsUploading(true));
    dispatch(setUploadProgress(0));

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      dispatch(setUploadProgress(progress));

      if (progress >= 100) {
        clearInterval(interval);
        dispatch(setIsUploading(false));
        dispatch(setUploadedVideo(file));

        // Add initial segment to timeline
        const segmentId = generateId();
        dispatch(addSegment({
          id: segmentId,
          startTime: 0,
          endTime: 100, 
          name: file.name
        }));

        // Add original audio track
        dispatch(addAudioTrack({
          id: generateId(),
          name: 'Original Audio',
          startTime: 0,
          endTime: 100, // This will be updated when video metadata is loaded
          volume: 1,
          isMuted: false,
          isOriginal: true
        }));
      }
    }, 100);
  }, [dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    maxFiles: 1
  });

  // Get the current upload progress from Redux
  const uploadProgress = useSelector((state: RootState) => state.video.uploadProgress);
  const isUploading = useSelector((state: RootState) => state.video.isUploading);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-neutral-300 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="m21 15-5-5-5 5" />
              <path d="M14.5 16.5V10h2v6.5" />
              <path d="M8 16h1.5a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4H10" />
              <path d="M7 8h8" />
              <path d="M7 12h8" />
              <path d="M7 16h8" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop the video here' : 'Drag & drop your video here'}
            </p>
            <p className="text-sm text-neutral-500 mt-1">
              or click to browse files
            </p>
          </div>
          <Button variant="outline" className="mt-2">
            Select Video
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Upload Progress</p>
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-right mt-1">{Math.round(uploadProgress)}%</p>
        </div>
      )}
    </div>
  );
}
