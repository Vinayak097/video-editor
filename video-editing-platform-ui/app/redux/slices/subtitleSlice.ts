import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Subtitle {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  font: string;
  fontSize: number;
  color: string;
  position: {
    x: number;
    y: number;
  };
}

export interface SubtitleState {
  subtitles: Subtitle[];
  selectedSubtitleId: string | null;
}

const initialState: SubtitleState = {
  subtitles: [],
  selectedSubtitleId: null,
};

export const subtitleSlice = createSlice({
  name: 'subtitle',
  initialState,
  reducers: {
    addSubtitle: (state, action: PayloadAction<Subtitle>) => {
      state.subtitles.push(action.payload);
    },
    updateSubtitle: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Subtitle> }>
    ) => {
      const { id, updates } = action.payload;
      const subtitleIndex = state.subtitles.findIndex((subtitle) => subtitle.id === id);
      if (subtitleIndex !== -1) {
        state.subtitles[subtitleIndex] = {
          ...state.subtitles[subtitleIndex],
          ...updates,
        };
      }
    },
    removeSubtitle: (state, action: PayloadAction<string>) => {
      state.subtitles = state.subtitles.filter((subtitle) => subtitle.id !== action.payload);
      if (state.selectedSubtitleId === action.payload) {
        state.selectedSubtitleId = null;
      }
    },
    setSelectedSubtitle: (state, action: PayloadAction<string | null>) => {
      state.selectedSubtitleId = action.payload;
    },
    resetSubtitles: () => initialState,
  },
});

export const {
  addSubtitle,
  updateSubtitle,
  removeSubtitle,
  setSelectedSubtitle,
  resetSubtitles,
} = subtitleSlice.actions;

export default subtitleSlice.reducer;
