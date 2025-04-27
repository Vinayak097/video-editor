import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AudioTrack {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  volume: number;
  isMuted: boolean;
  file?: File;
  url?: string;
  isOriginal: boolean;
}

export interface AudioState {
  tracks: AudioTrack[];
  selectedTrackId: string | null;
}

const initialState: AudioState = {
  tracks: [],
  selectedTrackId: null,
};

export const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    addAudioTrack: (state, action: PayloadAction<AudioTrack>) => {
      state.tracks.push(action.payload);
    },
    updateAudioTrack: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<AudioTrack> }>
    ) => {
      const { id, updates } = action.payload;
      const trackIndex = state.tracks.findIndex((track) => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = {
          ...state.tracks[trackIndex],
          ...updates,
        };
      }
    },
    removeAudioTrack: (state, action: PayloadAction<string>) => {
      const trackIndex = state.tracks.findIndex((track) => track.id === action.payload);
      if (trackIndex !== -1) {
        // Clean up URL if it exists
        if (state.tracks[trackIndex].url) {
          URL.revokeObjectURL(state.tracks[trackIndex].url!);
        }
        state.tracks = state.tracks.filter((track) => track.id !== action.payload);
      }
      if (state.selectedTrackId === action.payload) {
        state.selectedTrackId = null;
      }
    },
    setSelectedAudioTrack: (state, action: PayloadAction<string | null>) => {
      state.selectedTrackId = action.payload;
    },
    toggleMuteAudioTrack: (state, action: PayloadAction<string>) => {
      const trackIndex = state.tracks.findIndex((track) => track.id === action.payload);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].isMuted = !state.tracks[trackIndex].isMuted;
      }
    },
    setAudioTrackVolume: (
      state,
      action: PayloadAction<{ id: string; volume: number }>
    ) => {
      const { id, volume } = action.payload;
      const trackIndex = state.tracks.findIndex((track) => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex].volume = volume;
      }
    },
    resetAudio: (state) => {
      // Clean up URLs
      state.tracks.forEach((track) => {
        if (track.url && !track.isOriginal) {
          URL.revokeObjectURL(track.url);
        }
      });
      return initialState;
    },
  },
});

export const {
  addAudioTrack,
  updateAudioTrack,
  removeAudioTrack,
  setSelectedAudioTrack,
  toggleMuteAudioTrack,
  setAudioTrackVolume,
  resetAudio,
} = audioSlice.actions;

export default audioSlice.reducer;
