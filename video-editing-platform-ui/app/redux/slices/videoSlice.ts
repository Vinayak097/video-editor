import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VideoState {
  uploadedVideo: {
    file: File | null;
    url: string | null;
    thumbnail: string | null;
    duration: number;
    name: string;
    size: number;
  };
  isUploading: boolean;
  uploadProgress: number;
  isPlaying: boolean;
  currentTime: number;
}

const initialState: VideoState = {
  uploadedVideo: {
    file: null,
    url: null,
    thumbnail: null,
    duration: 0,
    name: '',
    size: 0,
  },
  isUploading: false,
  uploadProgress: 0,
  isPlaying: false,
  currentTime: 0,
};

export const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setUploadedVideo: (state, action: PayloadAction<File>) => {
      const file = action.payload;
      state.uploadedVideo.file = file;
      state.uploadedVideo.name = file.name;
      state.uploadedVideo.size = file.size;
      state.uploadedVideo.url = URL.createObjectURL(file);
    },
    setThumbnail: (state, action: PayloadAction<string>) => {
      state.uploadedVideo.thumbnail = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.uploadedVideo.duration = action.payload;
    },
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    resetVideo: (state) => {
      if (state.uploadedVideo.url) {
        URL.revokeObjectURL(state.uploadedVideo.url);
      }
      return initialState;
    },
  },
});

export const {
  setUploadedVideo,
  setThumbnail,
  setDuration,
  setIsUploading,
  setUploadProgress,
  setIsPlaying,
  setCurrentTime,
  resetVideo,
} = videoSlice.actions;

export default videoSlice.reducer;
